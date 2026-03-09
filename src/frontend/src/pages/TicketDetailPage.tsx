import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { Principal } from "@icp-sdk/core/principal";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  Tag,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TicketStatus, TicketType, UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import { PriorityBadge, StatusBadge } from "../components/shared/StatusBadge";
import {
  useAddComment,
  useAllUsers,
  useAssignTicket,
  useMyProfile,
  useTicket,
  useUpdateTicketStatus,
} from "../hooks/useQueries";

interface TicketDetailPageProps {
  ticketType: TicketType;
}

const statusOptions = [
  { value: TicketStatus.Open, label: "Open" },
  { value: TicketStatus.InProgress, label: "In Progress" },
  { value: TicketStatus.Resolved, label: "Resolved" },
  { value: TicketStatus.Closed, label: "Closed" },
];

export function TicketDetailPage({ ticketType }: TicketDetailPageProps) {
  const params = useParams({ strict: false }) as { id?: string };
  const ticketId = params.id ? BigInt(params.id) : null;
  const [commentText, setCommentText] = useState("");

  const { data: ticket, isLoading: ticketLoading } = useTicket(ticketId);
  const { data: profile } = useMyProfile();
  const { data: allUsers } = useAllUsers();
  const updateStatus = useUpdateTicketStatus();
  const assignTicket = useAssignTicket();
  const addComment = useAddComment();

  const isIncident = ticketType === TicketType.Incident;
  const backRoute = isIncident ? "/incidents" : "/service-requests";
  const backLabel = isIncident ? "Incidents" : "Service Requests";
  const title = ticket
    ? `${isIncident ? "INC" : "SR"}-${ticket.id.toString()}`
    : "Loading...";

  const canManage =
    profile?.role === UserRole.ITAgent ||
    profile?.role === UserRole.Manager ||
    profile?.role === UserRole.MasterAdmin;

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    try {
      await updateStatus.mutateAsync({
        id: ticket.id,
        status: newStatus as TicketStatus,
      });
      toast.success("Status updated successfully");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAssigneeChange = async (principalStr: string) => {
    if (!ticket || !allUsers) return;
    const user = allUsers.find((u) => u.principal.toString() === principalStr);
    if (!user) return;
    try {
      await assignTicket.mutateAsync({
        id: ticket.id,
        assigneeId: user.principal as Principal,
      });
      toast.success("Ticket assigned successfully");
    } catch {
      toast.error("Failed to assign ticket");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !commentText.trim()) return;
    try {
      await addComment.mutateAsync({
        ticketId: ticket.id,
        text: commentText.trim(),
      });
      setCommentText("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  if (ticketLoading) {
    return (
      <AppLayout title={title}>
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout title="Ticket Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">
            Ticket Not Found
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            The requested ticket could not be found.
          </p>
          <Link to={backRoute}>
            <Button variant="outline" className="border-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {backLabel}
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const assigneeUser = allUsers?.find(
    (u) => u.principal.toString() === ticket.assigneeId?.toString(),
  );

  const sortedComments = [...ticket.comments].sort(
    (a, b) => Number(a.createdAt) - Number(b.createdAt),
  );

  return (
    <AppLayout title={`${isIncident ? "Incident" : "Service Request"} Detail`}>
      <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
        {/* Back link */}
        <Link
          to={backRoute}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {backLabel}
        </Link>

        {/* Main ticket card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        #{ticket.id.toString()}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs border ${
                          isIncident
                            ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                            : "border-primary/30 text-primary bg-primary/10"
                        }`}
                      >
                        {isIncident ? "Incident" : "Service Request"}
                      </Badge>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                      {ticket.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    {ticket.category}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Created{" "}
                    {new Date(
                      Number(ticket.createdAt) / 1_000_000,
                    ).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Updated{" "}
                    {new Date(
                      Number(ticket.updatedAt) / 1_000_000,
                    ).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Reporter:{" "}
                    <code className="font-mono text-[10px]">
                      {ticket.reporterId.toString().slice(0, 16)}...
                    </code>
                  </span>
                </div>
              </div>
            </CardHeader>
            <Separator className="bg-border" />
            <CardContent className="pt-4">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions Panel */}
        {canManage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-sm font-semibold">
                  Manage Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status
                    </p>
                    <Select
                      value={ticket.status}
                      onValueChange={handleStatusChange}
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger
                        data-ocid="incident_detail.status_select"
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

                  {/* Assignee */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Assign To
                    </p>
                    <Select
                      value={ticket.assigneeId?.toString() ?? "unassigned"}
                      onValueChange={(v) => {
                        if (v !== "unassigned") handleAssigneeChange(v);
                      }}
                      disabled={assignTicket.isPending}
                    >
                      <SelectTrigger
                        data-ocid="incident_detail.assignee_select"
                        className="bg-input border-border"
                      >
                        <SelectValue placeholder="Select assignee..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="unassigned" disabled>
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
                    {assigneeUser && (
                      <p className="text-xs text-muted-foreground">
                        Currently assigned to:{" "}
                        <span className="font-medium text-foreground">
                          {assigneeUser.name}
                        </span>
                      </p>
                    )}
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
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Comments ({sortedComments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comment list */}
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

              {/* Add comment */}
              <Separator className="bg-border" />
              <form onSubmit={handleAddComment} className="space-y-3">
                <Textarea
                  data-ocid="incident_detail.comment_textarea"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="bg-input border-border resize-none text-sm"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    data-ocid="incident_detail.comment_submit_button"
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
