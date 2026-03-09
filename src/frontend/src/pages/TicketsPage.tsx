import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Clock,
  Filter,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  TicketPriority,
  TicketStatus,
  TicketType,
  UserRole,
} from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import { CreateTicketModal } from "../components/shared/CreateTicketModal";
import { PriorityBadge, StatusBadge } from "../components/shared/StatusBadge";
import { useListTickets, useMyProfile } from "../hooks/useQueries";

interface TicketsPageProps {
  ticketType: TicketType;
}

const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: TicketStatus.Open, label: "Open" },
  { value: TicketStatus.InProgress, label: "In Progress" },
  { value: TicketStatus.Resolved, label: "Resolved" },
  { value: TicketStatus.Closed, label: "Closed" },
];

const priorityOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: TicketPriority.Critical, label: "Critical" },
  { value: TicketPriority.High, label: "High" },
  { value: TicketPriority.Medium, label: "Medium" },
  { value: TicketPriority.Low, label: "Low" },
];

export function TicketsPage({ ticketType }: TicketsPageProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profile } = useMyProfile();

  const filter = {
    ticketType,
    ...(statusFilter !== "all" && { status: statusFilter as TicketStatus }),
    ...(priorityFilter !== "all" && {
      priority: priorityFilter as TicketPriority,
    }),
  };

  const { data: tickets, isLoading } = useListTickets(filter);

  const isIncident = ticketType === TicketType.Incident;
  const title = isIncident ? "Incidents" : "Service Requests";
  const newButtonOcid = isIncident
    ? "incidents.new_button"
    : "service_requests.new_button";
  const tableOcid = isIncident ? "incidents.table" : "service_requests.table";

  const canCreate =
    profile?.role === UserRole.EndUser ||
    profile?.role === UserRole.ITAgent ||
    profile?.role === UserRole.Manager ||
    profile?.role === UserRole.MasterAdmin;

  const filteredTickets =
    tickets?.filter((t) =>
      searchQuery
        ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    ) ?? [];

  return (
    <AppLayout title={title}>
      <div className="space-y-4 animate-fade-in">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid={
                  isIncident
                    ? "incidents.search_input"
                    : "service_requests.search_input"
                }
                placeholder="Search by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-56 bg-input border-border text-sm"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                data-ocid={
                  isIncident
                    ? "incidents.status_select"
                    : "service_requests.status_select"
                }
                className="w-36 bg-input border-border text-sm"
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

            {/* Priority filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger
                data-ocid={
                  isIncident
                    ? "incidents.priority_select"
                    : "service_requests.priority_select"
                }
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
              data-ocid={newButtonOcid}
              onClick={() => setShowCreate(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New {isIncident ? "Incident" : "Service Request"}
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
                  {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((sk) => (
                    <Skeleton key={sk} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredTickets.length === 0 ? (
                <div
                  data-ocid={`${isIncident ? "incidents" : "service_requests"}.empty_state`}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  {isIncident ? (
                    <AlertTriangle className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  ) : (
                    <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  )}
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No {title.toLowerCase()} found
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    priorityFilter !== "all"
                      ? "Try adjusting your filters"
                      : `Click "New ${isIncident ? "Incident" : "Service Request"}" to get started`}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid={tableOcid}>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground w-16">
                          ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Title
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Category
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-24">
                          Priority
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Assignee
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-24">
                          Created
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-20 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket, idx) => (
                        <TableRow
                          key={ticket.id.toString()}
                          data-ocid={`${isIncident ? "incidents" : "service_requests"}.item.${idx + 1}`}
                          className="border-border hover:bg-accent/30"
                        >
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            #{ticket.id.toString()}
                          </TableCell>
                          <TableCell>
                            <Link
                              to={
                                isIncident
                                  ? "/incidents/$id"
                                  : "/service-requests/$id"
                              }
                              params={{ id: ticket.id.toString() }}
                              className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                            >
                              {ticket.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground truncate max-w-[80px] block">
                              {ticket.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={ticket.priority} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={ticket.status} />
                          </TableCell>
                          <TableCell>
                            {ticket.assigneeId ? (
                              <Badge
                                variant="outline"
                                className="text-xs text-muted-foreground border-border font-mono"
                              >
                                {ticket.assigneeId.toString().slice(0, 8)}...
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground/50 italic">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(
                                Number(ticket.createdAt) / 1_000_000,
                              ).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              to={
                                isIncident
                                  ? "/incidents/$id"
                                  : "/service-requests/$id"
                              }
                              params={{ id: ticket.id.toString() }}
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

      <CreateTicketModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        ticketType={ticketType}
      />
    </AppLayout>
  );
}
