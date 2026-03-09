import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import { Clock, Filter, GitBranch, Loader2, Plus, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChangeStatus,
  ChangeType,
  ImpactLevel,
  TicketPriority,
  UserRole,
} from "../backend.d";

// RiskLevel has the same values as ImpactLevel (Low | Medium | High)
type RiskLevel = ImpactLevel;
import { AppLayout } from "../components/shared/AppLayout";
import { PriorityBadge } from "../components/shared/StatusBadge";
import {
  useAllUsers,
  useCreateChangeRequest,
  useListChangeRequests,
  useMyProfile,
} from "../hooks/useQueries";

export function ChangeStatusBadge({ status }: { status: ChangeStatus }) {
  const styles: Record<ChangeStatus, string> = {
    [ChangeStatus.Draft]:
      "bg-muted/40 text-muted-foreground border border-border",
    [ChangeStatus.SubmittedForApproval]:
      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    [ChangeStatus.Approved]:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    [ChangeStatus.Rejected]:
      "bg-red-500/15 text-red-400 border border-red-500/30",
    [ChangeStatus.InProgress]:
      "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    [ChangeStatus.Completed]:
      "bg-teal-500/15 text-teal-400 border border-teal-500/30",
    [ChangeStatus.Cancelled]:
      "bg-muted/40 text-muted-foreground/60 border border-border",
  };

  const labels: Record<ChangeStatus, string> = {
    [ChangeStatus.Draft]: "Draft",
    [ChangeStatus.SubmittedForApproval]: "Awaiting Approval",
    [ChangeStatus.Approved]: "Approved",
    [ChangeStatus.Rejected]: "Rejected",
    [ChangeStatus.InProgress]: "In Progress",
    [ChangeStatus.Completed]: "Completed",
    [ChangeStatus.Cancelled]: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function ChangeTypeBadge({ changeType }: { changeType: ChangeType }) {
  const styles: Record<ChangeType, string> = {
    [ChangeType.Standard]:
      "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    [ChangeType.Normal]:
      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    [ChangeType.Emergency]:
      "bg-red-500/10 text-red-400 border border-red-500/20",
  };

  return (
    <Badge variant="outline" className={`text-xs ${styles[changeType]}`}>
      {changeType}
    </Badge>
  );
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: ChangeStatus.Draft, label: "Draft" },
  { value: ChangeStatus.SubmittedForApproval, label: "Awaiting Approval" },
  { value: ChangeStatus.Approved, label: "Approved" },
  { value: ChangeStatus.Rejected, label: "Rejected" },
  { value: ChangeStatus.InProgress, label: "In Progress" },
  { value: ChangeStatus.Completed, label: "Completed" },
  { value: ChangeStatus.Cancelled, label: "Cancelled" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: ChangeType.Standard, label: "Standard" },
  { value: ChangeType.Normal, label: "Normal" },
  { value: ChangeType.Emergency, label: "Emergency" },
];

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: TicketPriority.Critical, label: "Critical" },
  { value: TicketPriority.High, label: "High" },
  { value: TicketPriority.Medium, label: "Medium" },
  { value: TicketPriority.Low, label: "Low" },
];

function CreateChangeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [changeType, setChangeType] = useState<ChangeType | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [impact, setImpact] = useState<ImpactLevel | "">("");
  const [risk, setRisk] = useState<RiskLevel | "">("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);

  const { data: allUsers } = useAllUsers();
  const createChange = useCreateChangeRequest();

  const toggleApprover = (principalStr: string) => {
    setSelectedApprovers((prev) =>
      prev.includes(principalStr)
        ? prev.filter((p) => p !== principalStr)
        : [...prev, principalStr],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !description.trim() ||
      !category.trim() ||
      !changeType ||
      !priority ||
      !impact ||
      !risk ||
      !plannedStart
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const plannedStartMs = new Date(plannedStart).getTime();
    if (Number.isNaN(plannedStartMs)) {
      toast.error("Invalid planned start date");
      return;
    }

    const plannedStartNs = BigInt(plannedStartMs) * 1_000_000n;
    let plannedEndNs: bigint | null = null;
    if (plannedEnd) {
      const endMs = new Date(plannedEnd).getTime();
      if (!Number.isNaN(endMs)) {
        plannedEndNs = BigInt(endMs) * 1_000_000n;
      }
    }

    const approverPrincipals: Principal[] = selectedApprovers
      .map(
        (ps) => allUsers?.find((u) => u.principal.toString() === ps)?.principal,
      )
      .filter((p): p is Principal => p !== undefined);

    try {
      await createChange.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        changeType: changeType as ChangeType,
        priority: priority as TicketPriority,
        impact: impact as ImpactLevel,
        risk: risk as RiskLevel,
        approverIds: approverPrincipals,
        plannedStart: plannedStartNs,
        plannedEnd: plannedEndNs,
      });
      toast.success("Change request created successfully");
      setTitle("");
      setDescription("");
      setCategory("");
      setChangeType("");
      setPriority("");
      setImpact("");
      setRisk("");
      setPlannedStart("");
      setPlannedEnd("");
      setSelectedApprovers([]);
      onClose();
    } catch {
      toast.error("Failed to create change request");
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setChangeType("");
    setPriority("");
    setImpact("");
    setRisk("");
    setPlannedStart("");
    setPlannedEnd("");
    setSelectedApprovers([]);
    onClose();
  };

  const staffUsers =
    allUsers?.filter(
      (u) =>
        u.role === UserRole.Manager ||
        u.role === UserRole.MasterAdmin ||
        u.role === UserRole.ITAgent,
    ) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="changes.dialog"
        className="sm:max-w-[620px] bg-card border-border max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            New Change Request
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chg-title">Title *</Label>
            <Input
              id="chg-title"
              data-ocid="changes.title_input"
              placeholder="Brief description of the change"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chg-desc">Description *</Label>
            <Textarea
              id="chg-desc"
              data-ocid="changes.description_textarea"
              placeholder="Detailed description of the change..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-input border-border resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chg-cat">Category *</Label>
              <Input
                id="chg-cat"
                placeholder="e.g. Infrastructure..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Change Type *</Label>
              <Select
                value={changeType}
                onValueChange={(v) => setChangeType(v as ChangeType)}
              >
                <SelectTrigger
                  data-ocid="changes.type_select"
                  className="bg-input border-border"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value={ChangeType.Standard}>Standard</SelectItem>
                  <SelectItem value={ChangeType.Normal}>Normal</SelectItem>
                  <SelectItem value={ChangeType.Emergency}>
                    🚨 Emergency
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TicketPriority)}
              >
                <SelectTrigger
                  data-ocid="changes.priority_select"
                  className="bg-input border-border"
                >
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value={TicketPriority.Critical}>
                    Critical
                  </SelectItem>
                  <SelectItem value={TicketPriority.High}>High</SelectItem>
                  <SelectItem value={TicketPriority.Medium}>Medium</SelectItem>
                  <SelectItem value={TicketPriority.Low}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Impact *</Label>
              <Select
                value={impact}
                onValueChange={(v) => setImpact(v as ImpactLevel)}
              >
                <SelectTrigger
                  data-ocid="changes.impact_select"
                  className="bg-input border-border"
                >
                  <SelectValue placeholder="Impact" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value={ImpactLevel.High}>High</SelectItem>
                  <SelectItem value={ImpactLevel.Medium}>Medium</SelectItem>
                  <SelectItem value={ImpactLevel.Low}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Risk *</Label>
              <Select
                value={risk}
                onValueChange={(v) => setRisk(v as RiskLevel)}
              >
                <SelectTrigger
                  data-ocid="changes.risk_select"
                  className="bg-input border-border"
                >
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value={ImpactLevel.High}>High</SelectItem>
                  <SelectItem value={ImpactLevel.Medium}>Medium</SelectItem>
                  <SelectItem value={ImpactLevel.Low}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chg-start">Planned Start *</Label>
              <Input
                id="chg-start"
                type="datetime-local"
                value={plannedStart}
                onChange={(e) => setPlannedStart(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chg-end">Planned End</Label>
              <Input
                id="chg-end"
                type="datetime-local"
                value={plannedEnd}
                onChange={(e) => setPlannedEnd(e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </div>
          {staffUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Approvers</Label>
              <div className="border border-border rounded-lg divide-y divide-border max-h-40 overflow-y-auto">
                {staffUsers.map((u) => (
                  <label
                    key={u.principal.toString()}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedApprovers.includes(
                        u.principal.toString(),
                      )}
                      onChange={() => toggleApprover(u.principal.toString())}
                      className="accent-primary"
                    />
                    <span className="text-sm text-foreground">{u.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {u.role}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="changes.cancel_button"
              onClick={handleClose}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="changes.submit_button"
              disabled={createChange.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createChange.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {createChange.isPending ? "Creating..." : "Create Change Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ChangesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profile } = useMyProfile();

  const filter = {
    ...(statusFilter !== "all" && { status: statusFilter as ChangeStatus }),
    ...(typeFilter !== "all" && { changeType: typeFilter as ChangeType }),
    ...(priorityFilter !== "all" && {
      priority: priorityFilter as TicketPriority,
    }),
  };

  const { data: changes, isLoading } = useListChangeRequests(filter);

  const canCreate =
    profile?.role === UserRole.ITAgent ||
    profile?.role === UserRole.Manager ||
    profile?.role === UserRole.MasterAdmin;

  const filtered =
    changes?.filter((c) =>
      searchQuery
        ? c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    ) ?? [];

  return (
    <AppLayout title="Change Management">
      <div data-ocid="changes.page" className="space-y-4 animate-fade-in">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="changes.search_input"
                placeholder="Search changes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-52 bg-input border-border text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                data-ocid="changes.status_select"
                className="w-44 bg-input border-border text-sm"
              >
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger
                data-ocid="changes.type_filter_select"
                className="w-36 bg-input border-border text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {typeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger
                data-ocid="changes.priority_filter_select"
                className="w-36 bg-input border-border text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {priorityOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canCreate && (
            <Button
              data-ocid="changes.primary_button"
              onClick={() => setShowCreate(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Change Request
            </Button>
          )}
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
                    <Skeleton key={sk} className="h-12 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div
                  data-ocid="changes.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <GitBranch className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No change requests found
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "Try adjusting your filters"
                      : 'Click "New Change Request" to get started'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="changes.table">
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground w-16">
                          ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Title
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Type
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-24">
                          Priority
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-20">
                          Impact
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-20">
                          Risk
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-36">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Planned Start
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-20 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((change, idx) => (
                        <TableRow
                          key={change.id.toString()}
                          data-ocid={`changes.item.${idx + 1}`}
                          className="border-border hover:bg-accent/30"
                        >
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            #CHG-{change.id.toString()}
                          </TableCell>
                          <TableCell>
                            <Link
                              to="/changes/$id"
                              params={{ id: change.id.toString() }}
                              className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                            >
                              {change.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <ChangeTypeBadge changeType={change.changeType} />
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={change.priority} />
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {change.impact}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {change.risk}
                            </span>
                          </TableCell>
                          <TableCell>
                            <ChangeStatusBadge status={change.status} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(
                                Number(change.plannedStart) / 1_000_000,
                              ).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              to="/changes/$id"
                              params={{ id: change.id.toString() }}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              View →
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <CreateChangeDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </AppLayout>
  );
}
