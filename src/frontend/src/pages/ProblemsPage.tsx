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
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Clock,
  Filter,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ProblemStatus, TicketPriority, UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import { PriorityBadge } from "../components/shared/StatusBadge";
import {
  useCreateProblem,
  useListProblems,
  useMyProfile,
} from "../hooks/useQueries";

function ProblemStatusBadge({ status }: { status: ProblemStatus }) {
  const styles: Record<ProblemStatus, string> = {
    [ProblemStatus.Identified]:
      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    [ProblemStatus.InAnalysis]:
      "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    [ProblemStatus.RootCauseFound]:
      "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    [ProblemStatus.Resolved]:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    [ProblemStatus.Closed]:
      "bg-muted/40 text-muted-foreground border border-border",
  };

  const labels: Record<ProblemStatus, string> = {
    [ProblemStatus.Identified]: "Identified",
    [ProblemStatus.InAnalysis]: "In Analysis",
    [ProblemStatus.RootCauseFound]: "Root Cause Found",
    [ProblemStatus.Resolved]: "Resolved",
    [ProblemStatus.Closed]: "Closed",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: ProblemStatus.Identified, label: "Identified" },
  { value: ProblemStatus.InAnalysis, label: "In Analysis" },
  { value: ProblemStatus.RootCauseFound, label: "Root Cause Found" },
  { value: ProblemStatus.Resolved, label: "Resolved" },
  { value: ProblemStatus.Closed, label: "Closed" },
];

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: TicketPriority.Critical, label: "Critical" },
  { value: TicketPriority.High, label: "High" },
  { value: TicketPriority.Medium, label: "Medium" },
  { value: TicketPriority.Low, label: "Low" },
];

function CreateProblemDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<TicketPriority | "">("");

  const createProblem = useCreateProblem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category.trim() || !priority) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createProblem.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority: priority as TicketPriority,
      });
      toast.success("Problem record created successfully");
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("");
      onClose();
    } catch {
      toast.error("Failed to create problem record");
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="problems.dialog"
        className="sm:max-w-[560px] bg-card border-border"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            New Problem Record
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prob-title">Title *</Label>
            <Input
              id="prob-title"
              data-ocid="problems.title_input"
              placeholder="Brief description of the problem"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prob-desc">Description *</Label>
            <Textarea
              id="prob-desc"
              data-ocid="problems.description_textarea"
              placeholder="Provide detailed information about the problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-input border-border resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prob-category">Category *</Label>
              <Input
                id="prob-category"
                data-ocid="problems.category_input"
                placeholder="e.g. Network, Hardware..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TicketPriority)}
              >
                <SelectTrigger
                  data-ocid="problems.priority_select"
                  className="bg-input border-border"
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value={TicketPriority.Critical}>
                    🔴 Critical
                  </SelectItem>
                  <SelectItem value={TicketPriority.High}>🟠 High</SelectItem>
                  <SelectItem value={TicketPriority.Medium}>
                    🟡 Medium
                  </SelectItem>
                  <SelectItem value={TicketPriority.Low}>🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="problems.cancel_button"
              onClick={handleClose}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="problems.submit_button"
              disabled={createProblem.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createProblem.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {createProblem.isPending ? "Creating..." : "Create Problem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProblemsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profile } = useMyProfile();

  const filter = {
    ...(statusFilter !== "all" && { status: statusFilter as ProblemStatus }),
    ...(priorityFilter !== "all" && {
      priority: priorityFilter as TicketPriority,
    }),
  };

  const { data: problems, isLoading } = useListProblems(filter);

  const canCreate =
    profile?.role === UserRole.ITAgent ||
    profile?.role === UserRole.Manager ||
    profile?.role === UserRole.MasterAdmin;

  const filtered =
    problems?.filter((p) =>
      searchQuery
        ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    ) ?? [];

  return (
    <AppLayout title="Problem Management">
      <div data-ocid="problems.page" className="space-y-4 animate-fade-in">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="problems.search_input"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-56 bg-input border-border text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                data-ocid="problems.status_select"
                className="w-40 bg-input border-border text-sm"
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
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger
                data-ocid="problems.priority_filter_select"
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
              data-ocid="problems.primary_button"
              onClick={() => setShowCreate(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Problem
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
                  data-ocid="problems.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <AlertCircle className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No problems found
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    priorityFilter !== "all"
                      ? "Try adjusting your filters"
                      : 'Click "New Problem" to create the first problem record'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="problems.table">
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
                        <TableHead className="text-xs font-semibold text-muted-foreground w-36">
                          Status
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
                      {filtered.map((problem, idx) => (
                        <TableRow
                          key={problem.id.toString()}
                          data-ocid={`problems.item.${idx + 1}`}
                          className="border-border hover:bg-accent/30"
                        >
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            #PRB-{problem.id.toString()}
                          </TableCell>
                          <TableCell>
                            <Link
                              to="/problems/$id"
                              params={{ id: problem.id.toString() }}
                              className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                            >
                              {problem.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground truncate max-w-[80px] block">
                              {problem.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={problem.priority} />
                          </TableCell>
                          <TableCell>
                            <ProblemStatusBadge status={problem.status} />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(
                                Number(problem.createdAt) / 1_000_000,
                              ).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              to="/problems/$id"
                              params={{ id: problem.id.toString() }}
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

      <CreateProblemDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </AppLayout>
  );
}
