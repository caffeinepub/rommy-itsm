import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  GitBranch,
  Inbox,
  Package,
  Server,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { TicketType } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import { PriorityBadge, StatusBadge } from "../components/shared/StatusBadge";
import { useDashboardStats, useListTickets } from "../hooks/useQueries";

function bigintToNum(v: bigint | undefined | null): number {
  if (v === undefined || v === null) return 0;
  return Number(v);
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  ocid: string;
  delay?: number;
}

function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  ocid,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        data-ocid={ocid}
        className="bg-card border-border hover:border-primary/30 transition-all duration-200 stat-card-glow"
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
            <div className={`p-2 rounded-lg ${bgColor}`}>
              <span className={color}>{icon}</span>
            </div>
          </div>
          <div className={`text-3xl font-display font-bold ${color}`}>
            {value.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentTickets, isLoading: ticketsLoading } = useListTickets({});

  const topTickets = recentTickets
    ? [...recentTickets]
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
        .slice(0, 10)
    : [];

  const open = bigintToNum(stats?.totalOpen);
  const inProgress = bigintToNum(stats?.totalInProgress);
  const resolved = bigintToNum(stats?.totalResolved);
  const closed = bigintToNum(stats?.totalClosed);

  const incidentOpen = bigintToNum(stats?.incidentOpen);
  const incidentIP = bigintToNum(stats?.incidentInProgress);
  const incidentResolved = bigintToNum(stats?.incidentResolved);
  const incidentClosed = bigintToNum(stats?.incidentClosed);

  const srOpen = bigintToNum(stats?.serviceRequestOpen);
  const srIP = bigintToNum(stats?.serviceRequestInProgress);
  const srResolved = bigintToNum(stats?.serviceRequestResolved);
  const srClosed = bigintToNum(stats?.serviceRequestClosed);

  // Phase 2 stats
  const problemOpen = bigintToNum(stats?.problemOpen);
  const problemInAnalysis = bigintToNum(stats?.problemInAnalysis);
  const problemResolved = bigintToNum(stats?.problemResolved);
  const changeInProgress = bigintToNum(stats?.changeInProgress);
  const changePendingApproval = bigintToNum(stats?.changePendingApproval);
  const changeCompleted = bigintToNum(stats?.changeCompleted);
  const assetActive = bigintToNum(stats?.assetActive);
  const assetInactive = bigintToNum(stats?.assetInactive);
  const assetMaintenance = bigintToNum(stats?.assetMaintenance);

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Main Stats */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Overall Summary
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              ["sk1", "sk2", "sk3", "sk4"].map((sk) => (
                <SkeletonCard key={sk} />
              ))
            ) : (
              <>
                <StatCard
                  title="Total Open"
                  value={open}
                  icon={<Inbox className="h-4 w-4" />}
                  color="text-blue-400"
                  bgColor="bg-blue-500/10"
                  ocid="dashboard.open_card"
                  delay={0}
                />
                <StatCard
                  title="In Progress"
                  value={inProgress}
                  icon={<Activity className="h-4 w-4" />}
                  color="text-violet-400"
                  bgColor="bg-violet-500/10"
                  ocid="dashboard.inprogress_card"
                  delay={0.05}
                />
                <StatCard
                  title="Resolved"
                  value={resolved}
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  color="text-emerald-400"
                  bgColor="bg-emerald-500/10"
                  ocid="dashboard.resolved_card"
                  delay={0.1}
                />
                <StatCard
                  title="Closed"
                  value={closed}
                  icon={<XCircle className="h-4 w-4" />}
                  color="text-muted-foreground"
                  bgColor="bg-muted/50"
                  ocid="dashboard.closed_card"
                  delay={0.15}
                />
              </>
            )}
          </div>
        </div>

        {/* Phase 2 Stats */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Problems, Changes & Assets
          </h2>
          <div className="grid grid-cols-3 lg:grid-cols-9 gap-3">
            {statsLoading ? (
              [
                "sk1",
                "sk2",
                "sk3",
                "sk4",
                "sk5",
                "sk6",
                "sk7",
                "sk8",
                "sk9",
              ].map((sk) => <SkeletonCard key={sk} />)
            ) : (
              <>
                {/* Problems */}
                <StatCard
                  title="Problems Open"
                  value={problemOpen}
                  icon={<Zap className="h-4 w-4" />}
                  color="text-yellow-400"
                  bgColor="bg-yellow-500/10"
                  ocid="dashboard.problem_open_card"
                  delay={0.2}
                />
                <StatCard
                  title="In Analysis"
                  value={problemInAnalysis}
                  icon={<AlertCircle className="h-4 w-4" />}
                  color="text-orange-400"
                  bgColor="bg-orange-500/10"
                  ocid="dashboard.problem_analysis_card"
                  delay={0.22}
                />
                <StatCard
                  title="Prob. Resolved"
                  value={problemResolved}
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  color="text-emerald-400"
                  bgColor="bg-emerald-500/10"
                  ocid="dashboard.problem_resolved_card"
                  delay={0.24}
                />
                {/* Changes */}
                <StatCard
                  title="Changes Active"
                  value={changeInProgress}
                  icon={<GitBranch className="h-4 w-4" />}
                  color="text-primary"
                  bgColor="bg-primary/10"
                  ocid="dashboard.change_inprogress_card"
                  delay={0.26}
                />
                <StatCard
                  title="Pending Approval"
                  value={changePendingApproval}
                  icon={<Clock className="h-4 w-4" />}
                  color="text-violet-400"
                  bgColor="bg-violet-500/10"
                  ocid="dashboard.change_pending_card"
                  delay={0.28}
                />
                <StatCard
                  title="Chg. Completed"
                  value={changeCompleted}
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  color="text-teal-400"
                  bgColor="bg-teal-500/10"
                  ocid="dashboard.change_completed_card"
                  delay={0.3}
                />
                {/* Assets */}
                <StatCard
                  title="Assets Active"
                  value={assetActive}
                  icon={<Package className="h-4 w-4" />}
                  color="text-emerald-400"
                  bgColor="bg-emerald-500/10"
                  ocid="dashboard.asset_active_card"
                  delay={0.32}
                />
                <StatCard
                  title="Assets Inactive"
                  value={assetInactive}
                  icon={<Package className="h-4 w-4" />}
                  color="text-muted-foreground"
                  bgColor="bg-muted/50"
                  ocid="dashboard.asset_inactive_card"
                  delay={0.34}
                />
                <StatCard
                  title="In Maintenance"
                  value={assetMaintenance}
                  icon={<Activity className="h-4 w-4" />}
                  color="text-yellow-400"
                  bgColor="bg-yellow-500/10"
                  ocid="dashboard.asset_maintenance_card"
                  delay={0.36}
                />
              </>
            )}
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Incidents */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-2">
                    {["sk1", "sk2", "sk3", "sk4"].map((sk) => (
                      <Skeleton key={sk} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[
                      {
                        label: "Open",
                        value: incidentOpen,
                        color: "text-blue-400",
                      },
                      {
                        label: "In Progress",
                        value: incidentIP,
                        color: "text-violet-400",
                      },
                      {
                        label: "Resolved",
                        value: incidentResolved,
                        color: "text-emerald-400",
                      },
                      {
                        label: "Closed",
                        value: incidentClosed,
                        color: "text-muted-foreground",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                      >
                        <span className="text-sm text-muted-foreground">
                          {row.label}
                        </span>
                        <span
                          className={`text-sm font-bold font-display ${row.color}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Requests */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  Service Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-2">
                    {["sk1", "sk2", "sk3", "sk4"].map((sk) => (
                      <Skeleton key={sk} className="h-6 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[
                      { label: "Open", value: srOpen, color: "text-blue-400" },
                      {
                        label: "In Progress",
                        value: srIP,
                        color: "text-violet-400",
                      },
                      {
                        label: "Resolved",
                        value: srResolved,
                        color: "text-emerald-400",
                      },
                      {
                        label: "Closed",
                        value: srClosed,
                        color: "text-muted-foreground",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                      >
                        <span className="text-sm text-muted-foreground">
                          {row.label}
                        </span>
                        <span
                          className={`text-sm font-bold font-display ${row.color}`}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Tickets Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Recent Tickets
              </CardTitle>
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground border-border"
              >
                Last 10
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {ticketsLoading ? (
                <div className="p-4 space-y-2">
                  {["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
                    <Skeleton key={sk} className="h-10 w-full" />
                  ))}
                </div>
              ) : topTickets.length === 0 ? (
                <div
                  data-ocid="dashboard.empty_state"
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Clock className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No tickets yet. Create your first incident or service
                    request.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
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
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Created
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topTickets.map((ticket, idx) => {
                        const isTicketIncident =
                          ticket.ticketType === TicketType.Incident;
                        return (
                          <TableRow
                            key={ticket.id.toString()}
                            data-ocid={`dashboard.row.${idx + 1}`}
                            className="border-border hover:bg-accent/30 cursor-pointer"
                          >
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              #{ticket.id.toString()}
                            </TableCell>
                            <TableCell>
                              <Link
                                to={
                                  isTicketIncident
                                    ? "/incidents/$id"
                                    : "/service-requests/$id"
                                }
                                params={{ id: ticket.id.toString() }}
                                className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate max-w-[200px] block"
                              >
                                {ticket.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-xs border ${
                                  ticket.ticketType === TicketType.Incident
                                    ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                                    : "border-primary/30 text-primary bg-primary/10"
                                }`}
                              >
                                {ticket.ticketType === TicketType.Incident
                                  ? "Incident"
                                  : "SR"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <PriorityBadge priority={ticket.priority} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={ticket.status} />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(
                                Number(ticket.createdAt) / 1_000_000,
                              ).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
