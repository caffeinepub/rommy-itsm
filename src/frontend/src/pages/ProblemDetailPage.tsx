import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Clock,
  Loader2,
  MessageSquare,
  Save,
  Send,
  Tag,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ProblemStatus, UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import { PriorityBadge } from "../components/shared/StatusBadge";
import {
  useAddCommentToProblem,
  useAllUsers,
  useMyProfile,
  useProblem,
  useUpdateProblemDetails,
  useUpdateProblemStatus,
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
  { value: ProblemStatus.Identified, label: "Identified" },
  { value: ProblemStatus.InAnalysis, label: "In Analysis" },
  { value: ProblemStatus.RootCauseFound, label: "Root Cause Found" },
  { value: ProblemStatus.Resolved, label: "Resolved" },
  { value: ProblemStatus.Closed, label: "Closed" },
];

export function ProblemDetailPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const problemId = params.id ? BigInt(params.id) : null;

  const [commentText, setCommentText] = useState("");
  const [rcaEditMode, setRcaEditMode] = useState(false);
  const [rcaRootCause, setRcaRootCause] = useState("");
  const [rcaWorkaround, setRcaWorkaround] = useState("");
  const [rcaLinkedIds, setRcaLinkedIds] = useState("");
  const [rcaAssignee, setRcaAssignee] = useState("unassigned");

  const { data: problem, isLoading } = useProblem(problemId);
  const { data: profile } = useMyProfile();
  const { data: allUsers } = useAllUsers();
  const updateStatus = useUpdateProblemStatus();
  const updateDetails = useUpdateProblemDetails();
  const addComment = useAddCommentToProblem();

  const canManage =
    profile?.role === UserRole.ITAgent ||
    profile?.role === UserRole.Manager ||
    profile?.role === UserRole.MasterAdmin;

  const handleStatusChange = async (newStatus: string) => {
    if (!problem) return;
    try {
      await updateStatus.mutateAsync({
        id: problem.id,
        status: newStatus as ProblemStatus,
      });
      toast.success("Status updated successfully");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleStartRcaEdit = () => {
    if (!problem) return;
    setRcaRootCause(problem.rootCause ?? "");
    setRcaWorkaround(problem.workaround ?? "");
    setRcaLinkedIds(
      problem.linkedIncidentIds.map((id) => id.toString()).join(", "),
    );
    setRcaAssignee(problem.assigneeId?.toString() ?? "unassigned");
    setRcaEditMode(true);
  };

  const handleSaveRca = async () => {
    if (!problem || !allUsers) return;

    const linkedIds: bigint[] = rcaLinkedIds
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => {
        try {
          return BigInt(s);
        } catch {
          return null;
        }
      })
      .filter((id): id is bigint => id !== null);

    const assigneeUser =
      rcaAssignee !== "unassigned"
        ? allUsers.find((u) => u.principal.toString() === rcaAssignee)
        : null;

    try {
      await updateDetails.mutateAsync({
        id: problem.id,
        title: problem.title,
        description: problem.description,
        rootCause: rcaRootCause.trim() || null,
        workaround: rcaWorkaround.trim() || null,
        assigneeId: assigneeUser?.principal ?? null,
        linkedIncidentIds: linkedIds,
      });
      toast.success("Problem details updated");
      setRcaEditMode(false);
    } catch {
      toast.error("Failed to update problem details");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || !commentText.trim()) return;
    try {
      await addComment.mutateAsync({
        problemId: problem.id,
        text: commentText.trim(),
      });
      setCommentText("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Problem Detail">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!problem) {
    return (
      <AppLayout title="Problem Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">
            Problem Not Found
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            The requested problem record could not be found.
          </p>
          <Link to="/problems">
            <Button variant="outline" className="border-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Problems
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const assigneeUser = allUsers?.find(
    (u) => u.principal.toString() === problem.assigneeId?.toString(),
  );

  const sortedComments = [...problem.comments].sort(
    (a, b) => Number(a.createdAt) - Number(b.createdAt),
  );

  return (
    <AppLayout title="Problem Detail">
      <div
        data-ocid="problem_detail.page"
        className="max-w-4xl mx-auto space-y-5 animate-fade-in"
      >
        {/* Back link */}
        <Link
          to="/problems"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Problems
        </Link>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="pt-5 pb-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        #PRB-{problem.id.toString()}
                      </span>
                      <ProblemStatusBadge status={problem.status} />
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                      {problem.title}
                    </h2>
                  </div>
                  <div className="flex-shrink-0">
                    <PriorityBadge priority={problem.priority} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    {problem.category}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Created{" "}
                    {new Date(
                      Number(problem.createdAt) / 1_000_000,
                    ).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Updated{" "}
                    {new Date(
                      Number(problem.updatedAt) / 1_000_000,
                    ).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Reporter:{" "}
                    <code className="font-mono text-[10px]">
                      {problem.reporterId.toString().slice(0, 16)}...
                    </code>
                  </span>
                  {assigneeUser && (
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Assignee:{" "}
                      <span className="font-medium text-foreground">
                        {assigneeUser.name}
                      </span>
                    </span>
                  )}
                </div>

                <Separator className="bg-border" />
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status + Assign (staff only) */}
        {canManage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-sm font-semibold">
                  Manage Problem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status
                    </p>
                    <Select
                      value={problem.status}
                      onValueChange={handleStatusChange}
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger
                        data-ocid="problem_detail.status_select"
                        className="bg-input border-border"
                      >
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
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Assign To
                    </p>
                    <Select
                      value={
                        rcaEditMode
                          ? rcaAssignee
                          : (problem.assigneeId?.toString() ?? "unassigned")
                      }
                      onValueChange={(v) => {
                        if (rcaEditMode) setRcaAssignee(v);
                      }}
                      disabled={!rcaEditMode}
                    >
                      <SelectTrigger
                        data-ocid="problem_detail.assignee_select"
                        className="bg-input border-border"
                      >
                        <SelectValue placeholder="Select assignee..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="unassigned">
                          — Unassigned —
                        </SelectItem>
                        {allUsers
                          ?.filter(
                            (u) =>
                              u.role === UserRole.ITAgent ||
                              u.role === UserRole.Manager ||
                              u.role === UserRole.MasterAdmin,
                          )
                          .map((u) => (
                            <SelectItem
                              key={u.principal.toString()}
                              value={u.principal.toString()}
                            >
                              {u.name} ({u.role})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {!rcaEditMode && (
                      <p className="text-xs text-muted-foreground/60">
                        Enable edit mode below to change assignee
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Root Cause Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Root Cause Analysis
                </CardTitle>
                {canManage && !rcaEditMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="problem_detail.edit_button"
                    onClick={handleStartRcaEdit}
                    className="border-border text-xs"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {rcaEditMode ? (
                <>
                  <div className="space-y-2">
                    <Label>Root Cause</Label>
                    <Textarea
                      data-ocid="problem_detail.textarea"
                      placeholder="Describe the root cause of the problem..."
                      value={rcaRootCause}
                      onChange={(e) => setRcaRootCause(e.target.value)}
                      rows={3}
                      className="bg-input border-border resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Workaround</Label>
                    <Textarea
                      placeholder="Describe any available workaround..."
                      value={rcaWorkaround}
                      onChange={(e) => setRcaWorkaround(e.target.value)}
                      rows={3}
                      className="bg-input border-border resize-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Linked Incident IDs</Label>
                    <Input
                      placeholder="e.g. 1, 2, 5"
                      value={rcaLinkedIds}
                      onChange={(e) => setRcaLinkedIds(e.target.value)}
                      className="bg-input border-border text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of incident IDs
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRcaEditMode(false)}
                      className="border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      data-ocid="problem_detail.save_button"
                      onClick={handleSaveRca}
                      disabled={updateDetails.isPending}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {updateDetails.isPending ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-3.5 w-3.5" />
                      )}
                      {updateDetails.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                      Root Cause
                    </p>
                    {problem.rootCause ? (
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {problem.rootCause}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">
                        Not yet identified
                      </p>
                    )}
                  </div>
                  <Separator className="bg-border" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                      Workaround
                    </p>
                    {problem.workaround ? (
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {problem.workaround}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">
                        No workaround available
                      </p>
                    )}
                  </div>
                  {problem.linkedIncidentIds.length > 0 && (
                    <>
                      <Separator className="bg-border" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                          Linked Incidents
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {problem.linkedIncidentIds.map((id) => (
                            <Link
                              key={id.toString()}
                              to="/incidents/$id"
                              params={{ id: id.toString() }}
                              className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 rounded px-2 py-0.5 hover:bg-primary/20 transition-colors"
                            >
                              #INC-{id.toString()}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Comments */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Comments ({sortedComments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedComments.length === 0 ? (
                <div className="py-6 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No comments yet. Be the first to comment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedComments.map((comment) => {
                    const commentUser = allUsers?.find(
                      (u) =>
                        u.principal.toString() === comment.authorId.toString(),
                    );
                    const initials = commentUser?.name
                      ? commentUser.name.slice(0, 2).toUpperCase()
                      : "U";
                    return (
                      <div
                        key={comment.id.toString()}
                        className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-foreground">
                              {commentUser?.name ?? "Unknown User"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                Number(comment.createdAt) / 1_000_000,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Separator className="bg-border" />
              <form onSubmit={handleAddComment} className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="bg-input border-border resize-none text-sm"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={addComment.isPending || !commentText.trim()}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {addComment.isPending ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-3.5 w-3.5" />
                    )}
                    {addComment.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
