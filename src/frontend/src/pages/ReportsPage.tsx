import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  GitBranch,
  Package,
  Server,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import {
  AssetStatus,
  AssetType,
  ChangeStatus,
  ProblemStatus,
  TicketPriority,
  TicketStatus,
  TicketType,
} from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import {
  useListAssets,
  useListChangeRequests,
  useListProblems,
  useListTickets,
} from "../hooks/useQueries";

// ── Helpers ────────────────────────────────────────────────────────

function count<T>(arr: T[], pred: (item: T) => boolean): number {
  return arr.filter(pred).length;
}

interface BarRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
  badge?: React.ReactNode;
}

function BarRow({ label, value, total, color, badge }: BarRowProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-28 text-xs text-muted-foreground truncate flex-shrink-0">
        {badge || label}
      </div>
      <div className="flex-1">
        <Progress value={pct} className={`h-2 ${color}`} />
      </div>
      <div className="w-16 text-right">
        <span className="text-sm font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground ml-1">({pct}%)</span>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { data: tickets, isLoading: tLoading } = useListTickets({});
  const { data: problems, isLoading: pLoading } = useListProblems({});
  const { data: changes, isLoading: cLoading } = useListChangeRequests({});
  const { data: assets, isLoading: aLoading } = useListAssets({});

  const isLoading = tLoading || pLoading || cLoading || aLoading;

  const allTickets = tickets ?? [];
  const allProblems = problems ?? [];
  const allChanges = changes ?? [];
  const allAssets = assets ?? [];

  // Ticket type split
  const totalTickets = allTickets.length;
  const incidents = count(
    allTickets,
    (t) => t.ticketType === TicketType.Incident,
  );
  const serviceRequests = count(
    allTickets,
    (t) => t.ticketType === TicketType.ServiceRequest,
  );

  // Ticket status breakdown
  const tOpen = count(allTickets, (t) => t.status === TicketStatus.Open);
  const tInProgress = count(
    allTickets,
    (t) => t.status === TicketStatus.InProgress,
  );
  const tResolved = count(
    allTickets,
    (t) => t.status === TicketStatus.Resolved,
  );
  const tClosed = count(allTickets, (t) => t.status === TicketStatus.Closed);

  // Priority distribution (all tickets)
  const pCritical = count(
    allTickets,
    (t) => t.priority === TicketPriority.Critical,
  );
  const pHigh = count(allTickets, (t) => t.priority === TicketPriority.High);
  const pMedium = count(
    allTickets,
    (t) => t.priority === TicketPriority.Medium,
  );
  const pLow = count(allTickets, (t) => t.priority === TicketPriority.Low);

  // Category distribution (top 5)
  const categoryMap: Record<string, number> = {};
  for (const t of allTickets) {
    categoryMap[t.category] = (categoryMap[t.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Problem status
  const totalProblems = allProblems.length;
  const probIdentified = count(
    allProblems,
    (p) => p.status === ProblemStatus.Identified,
  );
  const probInAnalysis = count(
    allProblems,
    (p) => p.status === ProblemStatus.InAnalysis,
  );
  const probRCFound = count(
    allProblems,
    (p) => p.status === ProblemStatus.RootCauseFound,
  );
  const probResolved = count(
    allProblems,
    (p) => p.status === ProblemStatus.Resolved,
  );
  const probClosed = count(
    allProblems,
    (p) => p.status === ProblemStatus.Closed,
  );

  // Change status
  const totalChanges = allChanges.length;
  const chDraft = count(allChanges, (c) => c.status === ChangeStatus.Draft);
  const chPending = count(
    allChanges,
    (c) => c.status === ChangeStatus.SubmittedForApproval,
  );
  const chApproved = count(
    allChanges,
    (c) => c.status === ChangeStatus.Approved,
  );
  const chInProgress = count(
    allChanges,
    (c) => c.status === ChangeStatus.InProgress,
  );
  const chCompleted = count(
    allChanges,
    (c) => c.status === ChangeStatus.Completed,
  );
  const chRejected = count(
    allChanges,
    (c) => c.status === ChangeStatus.Rejected,
  );

  // Asset type distribution
  const totalAssets = allAssets.length;
  const aHardware = count(allAssets, (a) => a.assetType === AssetType.Hardware);
  const aSoftware = count(allAssets, (a) => a.assetType === AssetType.Software);
  const aNetwork = count(allAssets, (a) => a.assetType === AssetType.Network);
  const aService = count(allAssets, (a) => a.assetType === AssetType.Service);
  const aOther = count(allAssets, (a) => a.assetType === AssetType.Other);

  // Asset status distribution
  const aActive = count(allAssets, (a) => a.status === AssetStatus.Active);
  const aInactive = count(allAssets, (a) => a.status === AssetStatus.Inactive);
  const aMaintenance = count(
    allAssets,
    (a) => a.status === AssetStatus.Maintenance,
  );
  const aRetired = count(allAssets, (a) => a.status === AssetStatus.Retired);
  const aDisposed = count(allAssets, (a) => a.status === AssetStatus.Disposed);

  function SectionTitle({
    icon,
    title,
  }: {
    icon: React.ReactNode;
    title: string;
  }) {
    return (
      <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    );
  }

  return (
    <AppLayout title="Reports & Analytics">
      <div className="space-y-6 animate-fade-in">
        {/* Header summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  data-ocid="reports.tickets_card"
                  className="bg-card border-border"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        Total Tickets
                      </span>
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-3xl font-display font-bold text-foreground">
                      {totalTickets}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <Card
                  data-ocid="reports.problems_card"
                  className="bg-card border-border"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        Total Problems
                      </span>
                      <Zap className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div className="text-3xl font-display font-bold text-foreground">
                      {totalProblems}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card
                  data-ocid="reports.changes_card"
                  className="bg-card border-border"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        Total Changes
                      </span>
                      <GitBranch className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-3xl font-display font-bold text-foreground">
                      {totalChanges}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <Card
                  data-ocid="reports.assets_card"
                  className="bg-card border-border"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        Total Assets
                      </span>
                      <Package className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-display font-bold text-foreground">
                      {totalAssets}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        {/* Row 1: Ticket Type + Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <SectionTitle
                  icon={<BarChart3 className="h-4 w-4 text-primary" />}
                  title="Ticket Type Distribution"
                />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : totalTickets === 0 ? (
                  <p
                    data-ocid="reports.ticket_type.empty_state"
                    className="text-sm text-muted-foreground py-4 text-center"
                  >
                    No tickets yet
                  </p>
                ) : (
                  <div
                    data-ocid="reports.ticket_type_section"
                    className="space-y-1"
                  >
                    <BarRow
                      label="Incidents"
                      value={incidents}
                      total={totalTickets}
                      color="[&>div]:bg-amber-400"
                      badge={
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-500/30 text-amber-400"
                        >
                          Incidents
                        </Badge>
                      }
                    />
                    <BarRow
                      label="Service Requests"
                      value={serviceRequests}
                      total={totalTickets}
                      color="[&>div]:bg-primary"
                      badge={
                        <Badge
                          variant="outline"
                          className="text-xs border-primary/30 text-primary"
                        >
                          Svc Reqs
                        </Badge>
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <SectionTitle
                  icon={<Activity className="h-4 w-4 text-violet-400" />}
                  title="Ticket Status Breakdown"
                />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : totalTickets === 0 ? (
                  <p
                    data-ocid="reports.ticket_status.empty_state"
                    className="text-sm text-muted-foreground py-4 text-center"
                  >
                    No tickets yet
                  </p>
                ) : (
                  <div
                    data-ocid="reports.ticket_status_section"
                    className="space-y-1"
                  >
                    <BarRow
                      label="Open"
                      value={tOpen}
                      total={totalTickets}
                      color="[&>div]:bg-blue-400"
                    />
                    <BarRow
                      label="In Progress"
                      value={tInProgress}
                      total={totalTickets}
                      color="[&>div]:bg-violet-400"
                    />
                    <BarRow
                      label="Resolved"
                      value={tResolved}
                      total={totalTickets}
                      color="[&>div]:bg-emerald-400"
                    />
                    <BarRow
                      label="Closed"
                      value={tClosed}
                      total={totalTickets}
                      color="[&>div]:bg-muted-foreground"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Row 2: Priority + Top Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <SectionTitle
                  icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
                  title="Priority Distribution"
                />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : totalTickets === 0 ? (
                  <p
                    data-ocid="reports.priority.empty_state"
                    className="text-sm text-muted-foreground py-4 text-center"
                  >
                    No tickets yet
                  </p>
                ) : (
                  <div
                    data-ocid="reports.priority_section"
                    className="space-y-1"
                  >
                    <BarRow
                      label="Critical"
                      value={pCritical}
                      total={totalTickets}
                      color="[&>div]:bg-red-400"
                    />
                    <BarRow
                      label="High"
                      value={pHigh}
                      total={totalTickets}
                      color="[&>div]:bg-orange-400"
                    />
                    <BarRow
                      label="Medium"
                      value={pMedium}
                      total={totalTickets}
                      color="[&>div]:bg-amber-400"
                    />
                    <BarRow
                      label="Low"
                      value={pLow}
                      total={totalTickets}
                      color="[&>div]:bg-blue-400"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <SectionTitle
                  icon={<BarChart3 className="h-4 w-4 text-teal-400" />}
                  title="Top Ticket Categories"
                />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : topCategories.length === 0 ? (
                  <p
                    data-ocid="reports.categories.empty_state"
                    className="text-sm text-muted-foreground py-4 text-center"
                  >
                    No tickets yet
                  </p>
                ) : (
                  <div
                    data-ocid="reports.categories_section"
                    className="space-y-1"
                  >
                    {topCategories.map(([cat, val]) => (
                      <BarRow
                        key={cat}
                        label={cat}
                        value={val}
                        total={totalTickets}
                        color="[&>div]:bg-teal-400"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Row 3: Problems + Changes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <SectionTitle
                  icon={<Zap className="h-4 w-4 text-yellow-400" />}
                  title="Problem Status Summary"
                />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : totalProblems === 0 ? (
                  <p
                    data-ocid="reports.problems.empty_state"
                    className="text-sm text-muted-foreground py-4 text-center"
                  >
                    No problems recorded
                  </p>
                ) : (
                  <div
                    data-ocid="reports.problems_section"
                    className="space-y-1"
                  >
                    <BarRow
                      label="Identified"
                      value={probIdentified}
                      total={totalProblems}
                      color="[&>div]:bg-yellow-400"
                    />
                    <BarRow
                      label="In Analysis"
                      value={probInAnalysis}
                      total={totalProblems}
                      color="[&>div]:bg-orange-400"
                    />
                    <BarRow
                      label="Root Cause"
                      value={probRCFound}
                      total={totalProblems}
                      color="[&>div]:bg-violet-400"
                    />
                    <BarRow
                      label="Resolved"
                      value={probResolved}
                      total={totalProblems}
                      color="[&>div]:bg-emerald-400"
                    />
                    <BarRow
                      label="Closed"
                      value={probClosed}
                      total={totalProblems}
                      color="[&>div]:bg-muted-foreground"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <SectionTitle
                  icon={<GitBranch className="h-4 w-4 text-primary" />}
                  title="Change Request Summary"
                />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : totalChanges === 0 ? (
                  <p
                    data-ocid="reports.changes.empty_state"
                    className="text-sm text-muted-foreground py-4 text-center"
                  >
                    No change requests yet
                  </p>
                ) : (
                  <div
                    data-ocid="reports.changes_section"
                    className="space-y-1"
                  >
                    <BarRow
                      label="Draft"
                      value={chDraft}
                      total={totalChanges}
                      color="[&>div]:bg-muted-foreground"
                    />
                    <BarRow
                      label="For Approval"
                      value={chPending}
                      total={totalChanges}
                      color="[&>div]:bg-violet-400"
                    />
                    <BarRow
                      label="Approved"
                      value={chApproved}
                      total={totalChanges}
                      color="[&>div]:bg-emerald-400"
                    />
                    <BarRow
                      label="In Progress"
                      value={chInProgress}
                      total={totalChanges}
                      color="[&>div]:bg-primary"
                    />
                    <BarRow
                      label="Completed"
                      value={chCompleted}
                      total={totalChanges}
                      color="[&>div]:bg-teal-400"
                    />
                    <BarRow
                      label="Rejected"
                      value={chRejected}
                      total={totalChanges}
                      color="[&>div]:bg-red-400"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Row 4: Asset Type + Asset Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <SectionTitle
                  icon={<Package className="h-4 w-4 text-emerald-400" />}
                  title="Asset Type Distribution"
                />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : totalAssets === 0 ? (
                  <p
                    data-ocid="reports.asset_type.empty_state"
                    className="text-sm text-muted-foreground py-4 text-center"
                  >
                    No assets recorded
                  </p>
                ) : (
                  <div
                    data-ocid="reports.asset_type_section"
                    className="space-y-1"
                  >
                    <BarRow
                      label="Hardware"
                      value={aHardware}
                      total={totalAssets}
                      color="[&>div]:bg-emerald-400"
                    />
                    <BarRow
                      label="Software"
                      value={aSoftware}
                      total={totalAssets}
                      color="[&>div]:bg-blue-400"
                    />
                    <BarRow
                      label="Network"
                      value={aNetwork}
                      total={totalAssets}
                      color="[&>div]:bg-violet-400"
                    />
                    <BarRow
                      label="Service"
                      value={aService}
                      total={totalAssets}
                      color="[&>div]:bg-amber-400"
                    />
                    <BarRow
                      label="Other"
                      value={aOther}
                      total={totalAssets}
                      color="[&>div]:bg-muted-foreground"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <SectionTitle
                  icon={<CheckCircle2 className="h-4 w-4 text-teal-400" />}
                  title="Asset Status Overview"
                />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                  </div>
                ) : totalAssets === 0 ? (
                  <p
                    data-ocid="reports.asset_status.empty_state"
                    className="text-sm text-muted-foreground py-4 text-center"
                  >
                    No assets recorded
                  </p>
                ) : (
                  <div
                    data-ocid="reports.asset_status_section"
                    className="space-y-1"
                  >
                    <BarRow
                      label="Active"
                      value={aActive}
                      total={totalAssets}
                      color="[&>div]:bg-emerald-400"
                    />
                    <BarRow
                      label="Inactive"
                      value={aInactive}
                      total={totalAssets}
                      color="[&>div]:bg-muted-foreground"
                    />
                    <BarRow
                      label="Maintenance"
                      value={aMaintenance}
                      total={totalAssets}
                      color="[&>div]:bg-yellow-400"
                    />
                    <BarRow
                      label="Retired"
                      value={aRetired}
                      total={totalAssets}
                      color="[&>div]:bg-orange-400"
                    />
                    <BarRow
                      label="Disposed"
                      value={aDisposed}
                      total={totalAssets}
                      color="[&>div]:bg-red-400"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground">
            Data reflects all records across the system. Refresh the page to see
            the latest counts.
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
}
