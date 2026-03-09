import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Shield,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TicketPriority, TicketStatus, UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import { useListTickets, useMyProfile } from "../hooks/useQueries";

// ── SLA Config ────────────────────────────────────────────────────

const SLA_STORAGE_KEY = "rommy_sla_targets";

interface SLATarget {
  priority: TicketPriority;
  responseHours: number;
  resolutionHours: number;
  label: string;
  color: string;
  bgColor: string;
}

const defaultSLATargets: SLATarget[] = [
  {
    priority: TicketPriority.Critical,
    responseHours: 1,
    resolutionHours: 4,
    label: "Critical",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
  {
    priority: TicketPriority.High,
    responseHours: 4,
    resolutionHours: 8,
    label: "High",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  {
    priority: TicketPriority.Medium,
    responseHours: 8,
    resolutionHours: 24,
    label: "Medium",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    priority: TicketPriority.Low,
    responseHours: 24,
    resolutionHours: 72,
    label: "Low",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
];

function loadSLATargets(): SLATarget[] {
  try {
    const stored = localStorage.getItem(SLA_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SLATarget>[];
      return defaultSLATargets.map((def) => {
        const override = parsed.find((p) => p.priority === def.priority);
        return override
          ? {
              ...def,
              responseHours: override.responseHours ?? def.responseHours,
              resolutionHours: override.resolutionHours ?? def.resolutionHours,
            }
          : def;
      });
    }
  } catch {
    // ignore
  }
  return defaultSLATargets;
}

function saveSLATargets(targets: SLATarget[]) {
  localStorage.setItem(
    SLA_STORAGE_KEY,
    JSON.stringify(
      targets.map((t) => ({
        priority: t.priority,
        responseHours: t.responseHours,
        resolutionHours: t.resolutionHours,
      })),
    ),
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function hoursLabel(h: number): string {
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  const rem = h % 24;
  return rem > 0 ? `${d}d ${rem}h` : `${d}d`;
}

type SLAStatus = "met" | "breached" | "at_risk" | "open";

function getTicketSLAStatus(
  createdAt: bigint,
  status: TicketStatus,
  resolutionHours: number,
): SLAStatus {
  const nowMs = Date.now();
  const createdMs = Number(createdAt) / 1_000_000;
  const elapsedHours = (nowMs - createdMs) / (1000 * 60 * 60);

  const isClosed =
    status === TicketStatus.Resolved || status === TicketStatus.Closed;
  if (isClosed) {
    return elapsedHours <= resolutionHours ? "met" : "breached";
  }
  if (elapsedHours > resolutionHours) return "breached";
  if (elapsedHours > resolutionHours * 0.8) return "at_risk";
  return "open";
}

export function SLAPage() {
  const { data: profile } = useMyProfile();
  const { data: tickets } = useListTickets({});
  const [slaTargets, setSlaTargets] = useState<SLATarget[]>(loadSLATargets);
  const [editTarget, setEditTarget] = useState<SLATarget | null>(null);
  const [editForm, setEditForm] = useState({
    responseHours: 1,
    resolutionHours: 4,
  });

  const isMasterAdmin = profile?.role === UserRole.MasterAdmin;

  // Compute compliance per priority
  const complianceData = slaTargets.map((sla) => {
    const priorityTickets = (tickets ?? []).filter(
      (t) => t.priority === sla.priority,
    );
    const total = priorityTickets.length;
    if (total === 0)
      return {
        ...sla,
        total: 0,
        met: 0,
        breached: 0,
        atRisk: 0,
        compliance: 100,
      };

    let met = 0;
    let breached = 0;
    let atRisk = 0;
    for (const t of priorityTickets) {
      const s = getTicketSLAStatus(t.createdAt, t.status, sla.resolutionHours);
      if (s === "met") met++;
      else if (s === "breached") breached++;
      else if (s === "at_risk") atRisk++;
    }
    const compliance = total > 0 ? Math.round((met / total) * 100) : 100;
    return { ...sla, total, met, breached, atRisk, compliance };
  });

  const overallTotal = complianceData.reduce((a, b) => a + b.total, 0);
  const overallMet = complianceData.reduce((a, b) => a + b.met, 0);
  const overallCompliance =
    overallTotal > 0 ? Math.round((overallMet / overallTotal) * 100) : 100;

  function openEdit(target: SLATarget) {
    setEditTarget(target);
    setEditForm({
      responseHours: target.responseHours,
      resolutionHours: target.resolutionHours,
    });
  }

  function saveEdit() {
    if (!editTarget) return;
    const updated = slaTargets.map((t) =>
      t.priority === editTarget.priority
        ? {
            ...t,
            responseHours: editForm.responseHours,
            resolutionHours: editForm.resolutionHours,
          }
        : t,
    );
    setSlaTargets(updated);
    saveSLATargets(updated);
    setEditTarget(null);
    toast.success("SLA target updated successfully");
  }

  return (
    <AppLayout title="SLA Management">
      <div className="space-y-6 animate-fade-in">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              data-ocid="sla.overall_compliance_card"
              className="bg-card border-border"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Overall Compliance
                  </span>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <div
                  className={`text-3xl font-display font-bold ${
                    overallCompliance >= 90
                      ? "text-emerald-400"
                      : overallCompliance >= 70
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {overallCompliance}%
                </div>
                <Progress value={overallCompliance} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Card
              data-ocid="sla.total_tracked_card"
              className="bg-card border-border"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    Tickets Tracked
                  </span>
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="text-3xl font-display font-bold text-foreground">
                  {overallTotal}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card data-ocid="sla.met_card" className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">SLA Met</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-display font-bold text-emerald-400">
                  {overallMet}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card
              data-ocid="sla.breached_card"
              className="bg-card border-border"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    SLA Breached
                  </span>
                  <XCircle className="h-4 w-4 text-red-400" />
                </div>
                <div className="text-3xl font-display font-bold text-red-400">
                  {complianceData.reduce((a, b) => a + b.breached, 0)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* SLA Targets Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                SLA Targets & Compliance
              </CardTitle>
              {!isMasterAdmin && (
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground border-border"
                >
                  View Only
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table data-ocid="sla.targets_table">
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Priority
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Response Time
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Resolution Time
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Total Tickets
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Met
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Breached
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      At Risk
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Compliance
                    </TableHead>
                    {isMasterAdmin && (
                      <TableHead className="text-xs font-semibold text-muted-foreground w-16">
                        Edit
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceData.map((row, idx) => (
                    <TableRow
                      key={row.priority}
                      data-ocid={`sla.targets_table.row.${idx + 1}`}
                      className="border-border hover:bg-accent/30"
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs border ${row.color} ${row.bgColor}`}
                        >
                          {row.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {hoursLabel(row.responseHours)}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {hoursLabel(row.resolutionHours)}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {row.total}
                      </TableCell>
                      <TableCell className="text-sm text-emerald-400 font-semibold">
                        {row.met}
                      </TableCell>
                      <TableCell className="text-sm text-red-400 font-semibold">
                        {row.breached}
                      </TableCell>
                      <TableCell className="text-sm text-amber-400 font-semibold">
                        {row.atRisk}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={row.compliance}
                            className="h-1.5 w-16"
                          />
                          <span
                            className={`text-xs font-bold ${
                              row.compliance >= 90
                                ? "text-emerald-400"
                                : row.compliance >= 70
                                  ? "text-amber-400"
                                  : "text-red-400"
                            }`}
                          >
                            {row.total === 0 ? "N/A" : `${row.compliance}%`}
                          </span>
                        </div>
                      </TableCell>
                      {isMasterAdmin && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-ocid={`sla.edit_button.${idx + 1}`}
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => openEdit(row)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Met: Resolved within SLA window</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>At Risk: Open &gt; 80% of SLA window</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                  <span>Breached: Exceeded SLA window</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent data-ocid="sla.edit_dialog" className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">
              Edit SLA Target — {editTarget?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sla-response" className="text-sm">
                Response Time (hours)
              </Label>
              <Input
                id="sla-response"
                data-ocid="sla.response_input"
                type="number"
                min={1}
                value={editForm.responseHours}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    responseHours: Math.max(
                      1,
                      Number.parseInt(e.target.value) || 1,
                    ),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sla-resolution" className="text-sm">
                Resolution Time (hours)
              </Label>
              <Input
                id="sla-resolution"
                data-ocid="sla.resolution_input"
                type="number"
                min={1}
                value={editForm.resolutionHours}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    resolutionHours: Math.max(
                      editForm.responseHours,
                      Number.parseInt(e.target.value) || 1,
                    ),
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="sla.edit_cancel_button"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button data-ocid="sla.edit_save_button" onClick={saveEdit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
