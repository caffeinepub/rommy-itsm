import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { SOP } from "../backend.d";
import { SOPStatus, UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import {
  useCreateSOP,
  useDeleteSOP,
  useListSOPs,
  useMyProfile,
  useUpdateSOP,
  useUpdateSOPStatus,
} from "../hooks/useQueries";

const STAFF_ROLES = [UserRole.ITAgent, UserRole.Manager, UserRole.MasterAdmin];

const statusStyles: Record<SOPStatus, string> = {
  [SOPStatus.Draft]: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  [SOPStatus.Active]:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  [SOPStatus.Archived]: "bg-muted/40 text-muted-foreground border-border",
};

const statusTransitions: Record<SOPStatus, SOPStatus[]> = {
  [SOPStatus.Draft]: [SOPStatus.Active],
  [SOPStatus.Active]: [SOPStatus.Archived],
  [SOPStatus.Archived]: [SOPStatus.Active],
};

function SOPForm({
  sop,
  onSubmit,
  onCancel,
  isPending,
}: {
  sop?: SOP;
  onSubmit: (data: {
    title: string;
    category: string;
    content: string;
    version: string;
    status: SOPStatus;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(sop?.title ?? "");
  const [category, setCategory] = useState(sop?.category ?? "");
  const [content, setContent] = useState(sop?.content ?? "");
  const [version, setVersion] = useState(sop?.version ?? "1.0");
  const [status, setStatus] = useState<SOPStatus>(
    sop?.status ?? SOPStatus.Draft,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !category.trim() ||
      !content.trim() ||
      !version.trim()
    ) {
      toast.error("All fields are required");
      return;
    }
    onSubmit({
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      version: version.trim(),
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sop-title">Title *</Label>
          <Input
            id="sop-title"
            data-ocid="sops.title_input"
            placeholder="e.g. Password Reset Procedure"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sop-category">Category *</Label>
          <Input
            id="sop-category"
            data-ocid="sops.category_input"
            placeholder="e.g. Security, Onboarding..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-input border-border"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sop-version">Version *</Label>
          <Input
            id="sop-version"
            data-ocid="sops.version_input"
            placeholder="e.g. 1.0, 2.1"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="bg-input border-border"
          />
        </div>
        {!sop && (
          <div className="space-y-2">
            <Label>Initial Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as SOPStatus)}
            >
              <SelectTrigger
                data-ocid="sops.status_select"
                className="bg-input border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value={SOPStatus.Draft}>Draft</SelectItem>
                <SelectItem value={SOPStatus.Active}>Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sop-content">Content *</Label>
        <Textarea
          id="sop-content"
          data-ocid="sops.textarea"
          placeholder="Write the SOP steps and procedures here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="bg-input border-border resize-none font-mono text-sm"
        />
      </div>
      <DialogFooter className="gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          data-ocid="sops.cancel_button"
          onClick={onCancel}
          className="border-border"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          data-ocid="sops.submit_button"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : sop ? "Update SOP" : "Create SOP"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function SOPViewDialog({
  sop,
  open,
  onClose,
}: {
  sop: SOP | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="sops.dialog"
        className="sm:max-w-[700px] bg-card border-border max-h-[85vh] overflow-y-auto"
      >
        {sop && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl leading-tight">
                {sop.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-primary/5 text-primary border-primary/20"
                >
                  {sop.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs border ${statusStyles[sop.status]}`}
                >
                  {sop.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  v{sop.version}
                </span>
                <span className="text-xs text-muted-foreground">
                  Updated{" "}
                  {new Date(
                    Number(sop.updatedAt) / 1_000_000,
                  ).toLocaleDateString()}
                </span>
              </div>
            </DialogHeader>
            <div className="mt-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 bg-muted/20 rounded-lg p-4 border border-border font-mono">
                {sop.content}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                data-ocid="sops.close_button"
                onClick={onClose}
                className="border-border"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SOPsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editSOP, setEditSOP] = useState<SOP | null>(null);
  const [viewSOP, setViewSOP] = useState<SOP | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: profile } = useMyProfile();
  const canManage = profile?.role && STAFF_ROLES.includes(profile.role);
  const canDelete = profile?.role === UserRole.MasterAdmin;

  const filter = {
    ...(statusFilter !== "all" && { status: statusFilter as SOPStatus }),
    ...(categoryFilter !== "all" && { category: categoryFilter }),
  };

  const { data: sops, isLoading } = useListSOPs(filter);
  const createSOP = useCreateSOP();
  const updateSOP = useUpdateSOP();
  const updateStatus = useUpdateSOPStatus();
  const deleteSOP = useDeleteSOP();

  const categories = [...new Set(sops?.map((s) => s.category) ?? [])].sort();

  const filtered =
    sops?.filter((s) =>
      searchQuery
        ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    ) ?? [];

  const handleCreate = async (data: {
    title: string;
    category: string;
    content: string;
    version: string;
    status: SOPStatus;
  }) => {
    try {
      await createSOP.mutateAsync(data);
      toast.success("SOP created successfully");
      setShowCreate(false);
    } catch {
      toast.error("Failed to create SOP");
    }
  };

  const handleUpdate = async (data: {
    title: string;
    category: string;
    content: string;
    version: string;
    status: SOPStatus;
  }) => {
    if (!editSOP) return;
    try {
      await updateSOP.mutateAsync({
        id: editSOP.id,
        title: data.title,
        category: data.category,
        content: data.content,
        version: data.version,
      });
      toast.success("SOP updated successfully");
      setEditSOP(null);
    } catch {
      toast.error("Failed to update SOP");
    }
  };

  const handleStatusChange = async (sop: SOP, newStatus: SOPStatus) => {
    try {
      await updateStatus.mutateAsync({ id: sop.id, status: newStatus });
      toast.success(`SOP status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteSOP.mutateAsync(deleteId);
      toast.success("SOP deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete SOP");
    }
  };

  return (
    <AppLayout title="SOPs & Process">
      <div data-ocid="sops.page" className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="sops.search_input"
                placeholder="Search SOPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-52 bg-input border-border text-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger
                data-ocid="sops.category_select"
                className="w-40 bg-input border-border text-sm"
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                data-ocid="sops.status_select"
                className="w-36 bg-input border-border text-sm"
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={SOPStatus.Draft}>Draft</SelectItem>
                <SelectItem value={SOPStatus.Active}>Active</SelectItem>
                <SelectItem value={SOPStatus.Archived}>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {canManage && (
            <Button
              data-ocid="sops.primary_button"
              onClick={() => setShowCreate(true)}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New SOP
            </Button>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="sops.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <FileText className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              No SOPs found
            </p>
            <p className="text-xs text-muted-foreground/60">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : canManage
                  ? 'Click "New SOP" to create the first standard operating procedure'
                  : "No SOPs are available yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((sop, idx) => {
              const isExpanded = expandedId === sop.id.toString();
              const transitions = statusTransitions[sop.status];
              return (
                <motion.div
                  key={sop.id.toString()}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  data-ocid={`sops.item.${idx + 1}`}
                >
                  <Card className="bg-card border-border hover:border-primary/20 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              setViewSOP(sop);
                              setShowViewDialog(true);
                            }}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left"
                          >
                            {sop.title}
                          </button>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <Badge
                              variant="outline"
                              className="text-xs bg-primary/5 text-primary border-primary/20"
                            >
                              {sop.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs border ${statusStyles[sop.status]}`}
                            >
                              {sop.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              v{sop.version}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                Number(sop.updatedAt) / 1_000_000,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {canManage && transitions.length > 0 && (
                            <Select
                              value={sop.status}
                              onValueChange={(v) =>
                                handleStatusChange(sop, v as SOPStatus)
                              }
                              disabled={updateStatus.isPending}
                            >
                              <SelectTrigger
                                data-ocid={`sops.status_toggle.${idx + 1}`}
                                className="h-7 text-xs w-28 bg-input border-border"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border">
                                <SelectItem value={sop.status}>
                                  {sop.status}
                                </SelectItem>
                                {transitions.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`sops.expand_button.${idx + 1}`}
                            onClick={() =>
                              setExpandedId(
                                isExpanded ? null : sop.id.toString(),
                              )
                            }
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          {canManage && (
                            <Button
                              size="sm"
                              variant="ghost"
                              data-ocid={`sops.edit_button.${idx + 1}`}
                              onClick={() => setEditSOP(sop)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              data-ocid={`sops.delete_button.${idx + 1}`}
                              onClick={() => setDeleteId(sop.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          <CardContent className="pt-0 pb-4">
                            <div className="whitespace-pre-wrap text-xs text-foreground/80 line-clamp-8 leading-relaxed bg-muted/20 rounded-lg p-3 border border-border font-mono">
                              {sop.content}
                            </div>
                            <Button
                              size="sm"
                              variant="link"
                              onClick={() => {
                                setViewSOP(sop);
                                setShowViewDialog(true);
                              }}
                              className="mt-2 h-auto p-0 text-xs text-primary"
                            >
                              View full SOP →
                            </Button>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent
          data-ocid="sops.create_dialog"
          className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">New SOP</DialogTitle>
          </DialogHeader>
          <SOPForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isPending={createSOP.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editSOP}
        onOpenChange={(o) => {
          if (!o) setEditSOP(null);
        }}
      >
        <DialogContent
          data-ocid="sops.edit_dialog"
          className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Edit SOP</DialogTitle>
          </DialogHeader>
          {editSOP && (
            <SOPForm
              sop={editSOP}
              onSubmit={handleUpdate}
              onCancel={() => setEditSOP(null)}
              isPending={updateSOP.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <SOPViewDialog
        sop={viewSOP}
        open={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setViewSOP(null);
        }}
      />

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <DialogContent
          data-ocid="sops.delete_dialog"
          className="sm:max-w-[400px] bg-card border-border"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-base">
              Delete SOP?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This SOP will be permanently deleted and cannot be recovered.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              data-ocid="sops.delete_cancel_button"
              onClick={() => setDeleteId(null)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              data-ocid="sops.delete_confirm_button"
              onClick={handleDelete}
              disabled={deleteSOP.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSOP.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
