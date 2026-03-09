import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  Shield,
  Tag,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ChangeStatus, UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import { PriorityBadge } from "../components/shared/StatusBadge";
import {
  useAddCommentToChange,
  useAllUsers,
  useApproveChange,
  useChangeRequest,
  useMyProfile,
  useRejectChange,
  useSubmitChangeForApproval,
  useUpdateChangeStatus,
} from "../hooks/useQueries";
import { ChangeStatusBadge, ChangeTypeBadge } from "./ChangesPage";

const statusOptions = [
  { value: ChangeStatus.Draft, label: "Draft" },
  { value: ChangeStatus.Approved, label: "Approved" },
  { value: ChangeStatus.InProgress, label: "In Progress" },
  { value: ChangeStatus.Completed, label: "Completed" },
  { value: ChangeStatus.Cancelled, label: "Cancelled" },
];

function ApprovalDialog({
  open,
  onClose,
  mode,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  mode: "approve" | "reject";
  onConfirm: (comment: string | null) => void;
  isPending: boolean;
}) {
  const [comment, setComment] = useState("");
  const isApprove = mode === "approve";

  const handleConfirm = () => {
    onConfirm(comment.trim() || null);
    setComment("");
  };

  const handleClose = () => {
    setComment("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="change_detail.dialog"
        className="sm:max-w-[460px] bg-card border-border"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            {isApprove ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Approve Change
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-400" />
                Reject Change
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {isApprove
              ? "You are approving this change request. You can optionally add a comment."
              : "Please provide a reason for rejecting this change request."}
          </p>
          <div className="space-y-1.5">
            <Label>Comment{isApprove ? " (optional)" : " *"}</Label>
            <Textarea
              placeholder={
                isApprove
                  ? "Approval notes (optional)..."
                  : "Reason for rejection..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="bg-input border-border resize-none text-sm"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            data-ocid="change_detail.cancel_button"
            onClick={handleClose}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            data-ocid={
              isApprove
                ? "change_detail.confirm_button"
                : "change_detail.confirm_button"
            }
            onClick={handleConfirm}
            disabled={isPending || (!isApprove && !comment.trim())}
            className={
              isApprove
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isPending ? "Processing..." : isApprove ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChangeDetailPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const changeId = params.id ? BigInt(params.id) : null;

  const [commentText, setCommentText] = useState("");
  const [approvalDialogMode, setApprovalDialogMode] = useState<
    "approve" | "reject" | null
  >(null);

  const { data: change, isLoading } = useChangeRequest(changeId);
  const { data: profile } = useMyProfile();
  const { data: allUsers } = useAllUsers();
  const updateStatus = useUpdateChangeStatus();
  const submitForApproval = useSubmitChangeForApproval();
  const approveChange = useApproveChange();
  const rejectChange = useRejectChange();
  const addComment = useAddCommentToChange();

  const canManage =
    profile?.role === UserRole.ITAgent ||
    profile?.role === UserRole.Manager ||
    profile?.role === UserRole.MasterAdmin;

  // Check if current user is an approver
  const isApprover =
    change &&
    profile &&
    allUsers &&
    change.approverIds.some((pid) => {
      const me = allUsers.find(
        (u) => u.principal.toString() === pid.toString(),
      );
      return me && me.name === profile.name;
    });

  // Check if current user has already decided
  const myDecision =
    change && allUsers && profile
      ? change.approvals.find((a) => {
          const approverUser = allUsers.find(
            (u) => u.principal.toString() === a.approverId.toString(),
          );
          return approverUser?.name === profile.name;
        })
      : undefined;

  const handleStatusChange = async (newStatus: string) => {
    if (!change) return;
    try {
      await updateStatus.mutateAsync({
        id: change.id,
        status: newStatus as ChangeStatus,
      });
      toast.success("Status updated successfully");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSubmitForApproval = async () => {
    if (!change) return;
    try {
      await submitForApproval.mutateAsync(change.id);
      toast.success("Change submitted for approval");
    } catch {
      toast.error("Failed to submit for approval");
    }
  };

  const handleApprovalDecision = async (comment: string | null) => {
    if (!change || !approvalDialogMode) return;
    try {
      if (approvalDialogMode === "approve") {
        await approveChange.mutateAsync({ id: change.id, comment });
        toast.success("Change approved");
      } else {
        await rejectChange.mutateAsync({ id: change.id, comment });
        toast.success("Change rejected");
      }
      setApprovalDialogMode(null);
    } catch {
      toast.error("Failed to process approval decision");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!change || !commentText.trim()) return;
    try {
      await addComment.mutateAsync({
        changeId: change.id,
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
      <AppLayout title="Change Detail">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!change) {
    return (
      <AppLayout title="Change Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">
            Change Not Found
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            The requested change request could not be found.
          </p>
          <Link to="/changes">
            <Button variant="outline" className="border-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Changes
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const sortedComments = [...change.comments].sort(
    (a, b) => Number(a.createdAt) - Number(b.createdAt),
  );

  const formatDate = (ns: bigint) =>
    new Date(Number(ns) / 1_000_000).toLocaleString();

  return (
    <AppLayout title="Change Detail">
      <div
        data-ocid="change_detail.page"
        className="max-w-4xl mx-auto space-y-5 animate-fade-in"
      >
        {/* Back link */}
        <Link
          to="/changes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Changes
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
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        #CHG-{change.id.toString()}
                      </span>
                      <ChangeTypeBadge changeType={change.changeType} />
                      <ChangeStatusBadge status={change.status} />
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                      {change.title}
                    </h2>
                  </div>
                  <div className="flex-shrink-0">
                    <PriorityBadge priority={change.priority} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    {change.category}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Impact:{" "}
                    <strong className="ml-1 text-foreground">
                      {change.impact}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Risk:{" "}
                    <strong className="ml-1 text-foreground">
                      {change.risk}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Planned: {formatDate(change.plannedStart)}
                    {change.plannedEnd && ` → ${formatDate(change.plannedEnd)}`}
                  </span>
                  {change.actualStart && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Actual: {formatDate(change.actualStart)}
                      {change.actualEnd && ` → ${formatDate(change.actualEnd)}`}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Requester:{" "}
                    <code className="font-mono text-[10px] ml-0.5">
                      {change.requesterId.toString().slice(0, 12)}...
                    </code>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Created {formatDate(change.createdAt)}
                  </span>
                </div>

                <Separator className="bg-border" />
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {change.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Approval Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Approvals ({change.approverIds.length} approvers)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {change.approverIds.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 italic">
                  No approvers assigned
                </p>
              ) : (
                <div className="space-y-2">
                  {change.approverIds.map((approverId) => {
                    const approverUser = allUsers?.find(
                      (u) => u.principal.toString() === approverId.toString(),
                    );
                    const decision = change.approvals.find(
                      (a) => a.approverId.toString() === approverId.toString(),
                    );
                    return (
                      <div
                        key={approverId.toString()}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/50"
                      >
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                            {approverUser?.name?.slice(0, 2).toUpperCase() ??
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {approverUser?.name ?? "Unknown User"}
                          </p>
                          {decision?.comment && (
                            <p className="text-xs text-muted-foreground truncate">
                              "{decision.comment}"
                            </p>
                          )}
                        </div>
                        {decision ? (
                          <Badge
                            variant="outline"
                            className={
                              decision.decision === "Approved"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-red-500/10 text-red-400 border-red-500/30"
                            }
                          >
                            {decision.decision}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted/40 text-muted-foreground border-border"
                          >
                            Pending
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Approve/Reject buttons for current approver */}
              {isApprover &&
                !myDecision &&
                change.status === ChangeStatus.SubmittedForApproval && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      data-ocid="change_detail.approve_button"
                      onClick={() => setApprovalDialogMode("approve")}
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      data-ocid="change_detail.reject_button"
                      onClick={() => setApprovalDialogMode("reject")}
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="mr-2 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Workflow actions (staff only) */}
        {canManage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-sm font-semibold">
                  Manage Change
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-end">
                  {change.status === ChangeStatus.Draft && (
                    <Button
                      data-ocid="change_detail.submit_button"
                      onClick={handleSubmitForApproval}
                      disabled={submitForApproval.isPending}
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {submitForApproval.isPending ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-3.5 w-3.5" />
                      )}
                      Submit for Approval
                    </Button>
                  )}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Update Status
                    </p>
                    <Select
                      value={change.status}
                      onValueChange={handleStatusChange}
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger
                        data-ocid="change_detail.status_select"
                        className="w-44 bg-input border-border"
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
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
                    No comments yet.
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
                              {formatDate(comment.createdAt)}
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

      {/* Approval Dialog */}
      <ApprovalDialog
        open={approvalDialogMode !== null}
        onClose={() => setApprovalDialogMode(null)}
        mode={approvalDialogMode ?? "approve"}
        onConfirm={handleApprovalDecision}
        isPending={approveChange.isPending || rejectChange.isPending}
      />
    </AppLayout>
  );
}
