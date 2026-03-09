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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { KnowledgeArticle } from "../backend.d";
import { UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import {
  useCreateKnowledgeArticle,
  useDeleteKnowledgeArticle,
  useGetKnowledgeArticle,
  useListKnowledgeArticles,
  useMyProfile,
  useUpdateKnowledgeArticle,
} from "../hooks/useQueries";

const STAFF_ROLES = [UserRole.ITAgent, UserRole.Manager, UserRole.MasterAdmin];

function ArticleForm({
  article,
  onSubmit,
  onCancel,
  isPending,
}: {
  article?: KnowledgeArticle;
  onSubmit: (data: {
    title: string;
    category: string;
    content: string;
    tags: string[];
    isPublished: boolean;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [tagsStr, setTagsStr] = useState(article?.tags.join(", ") ?? "");
  const [isPublished, setIsPublished] = useState(article?.isPublished ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !content.trim()) {
      toast.error("Title, category, and content are required");
      return;
    }
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSubmit({
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      tags,
      isPublished,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kb-title">Title *</Label>
          <Input
            id="kb-title"
            data-ocid="kb.title_input"
            placeholder="Article title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kb-category">Category *</Label>
          <Input
            id="kb-category"
            data-ocid="kb.category_input"
            placeholder="e.g. Networking, Hardware..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-input border-border"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="kb-content">Content *</Label>
        <Textarea
          id="kb-content"
          data-ocid="kb.textarea"
          placeholder="Write the article content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="bg-input border-border resize-none font-mono text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kb-tags">Tags (comma separated)</Label>
        <Input
          id="kb-tags"
          data-ocid="kb.tags_input"
          placeholder="e.g. vpn, password, onboarding"
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          className="bg-input border-border"
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="kb-published"
          data-ocid="kb.switch"
          checked={isPublished}
          onCheckedChange={setIsPublished}
        />
        <Label htmlFor="kb-published" className="cursor-pointer">
          Publish article (visible to all users)
        </Label>
      </div>
      <DialogFooter className="gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          data-ocid="kb.cancel_button"
          onClick={onCancel}
          className="border-border"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          data-ocid="kb.submit_button"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending
            ? "Saving..."
            : article
              ? "Update Article"
              : "Create Article"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ArticleViewDialog({
  articleId,
  open,
  onClose,
}: {
  articleId: bigint | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: article, isLoading } = useGetKnowledgeArticle(
    open ? articleId : null,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="kb.dialog"
        className="sm:max-w-[700px] bg-card border-border max-h-[85vh] overflow-y-auto"
      >
        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="space-y-2 mt-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <Skeleton key={n} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : article ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl leading-tight">
                {article.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-primary/5 text-primary border-primary/20"
                >
                  {article.category}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.viewCount.toString()} views
                </span>
                <span className="text-xs text-muted-foreground">
                  Updated{" "}
                  {new Date(
                    Number(article.updatedAt) / 1_000_000,
                  ).toLocaleDateString()}
                </span>
              </div>
            </DialogHeader>
            <div className="mt-4">
              <div className="prose prose-sm max-w-none text-foreground">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 bg-muted/20 rounded-lg p-4 border border-border font-mono">
                  {article.content}
                </div>
              </div>
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                data-ocid="kb.close_button"
                onClick={onClose}
                className="border-border"
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Article not found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function KnowledgeBasePage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editArticle, setEditArticle] = useState<KnowledgeArticle | null>(null);
  const [viewArticleId, setViewArticleId] = useState<bigint | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: profile } = useMyProfile();
  const canManage = profile?.role && STAFF_ROLES.includes(profile.role);

  const filter = {
    ...(publishedFilter === "published" && { isPublished: true }),
    ...(publishedFilter === "draft" && { isPublished: false }),
    ...(categoryFilter !== "all" && { category: categoryFilter }),
  };

  const { data: articles, isLoading } = useListKnowledgeArticles(filter);
  const createArticle = useCreateKnowledgeArticle();
  const updateArticle = useUpdateKnowledgeArticle();
  const deleteArticle = useDeleteKnowledgeArticle();

  const categories = [
    ...new Set(articles?.map((a) => a.category) ?? []),
  ].sort();

  const filtered =
    articles?.filter((a) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }) ?? [];

  const handleCreate = async (data: {
    title: string;
    category: string;
    content: string;
    tags: string[];
    isPublished: boolean;
  }) => {
    try {
      await createArticle.mutateAsync(data);
      toast.success("Article created successfully");
      setShowCreate(false);
    } catch {
      toast.error("Failed to create article");
    }
  };

  const handleUpdate = async (data: {
    title: string;
    category: string;
    content: string;
    tags: string[];
    isPublished: boolean;
  }) => {
    if (!editArticle) return;
    try {
      await updateArticle.mutateAsync({ id: editArticle.id, ...data });
      toast.success("Article updated successfully");
      setEditArticle(null);
    } catch {
      toast.error("Failed to update article");
    }
  };

  const handleTogglePublish = async (article: KnowledgeArticle) => {
    try {
      await updateArticle.mutateAsync({
        id: article.id,
        title: article.title,
        category: article.category,
        content: article.content,
        tags: article.tags,
        isPublished: !article.isPublished,
      });
      toast.success(
        article.isPublished ? "Article unpublished" : "Article published",
      );
    } catch {
      toast.error("Failed to update article");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteArticle.mutateAsync(deleteId);
      toast.success("Article deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete article");
    }
  };

  const handleViewArticle = (article: KnowledgeArticle) => {
    setViewArticleId(article.id);
    setShowViewDialog(true);
  };

  return (
    <AppLayout title="Knowledge Base">
      <div data-ocid="kb.page" className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="kb.search_input"
                placeholder="Search articles, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-56 bg-input border-border text-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger
                data-ocid="kb.category_select"
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
            {canManage && (
              <Select
                value={publishedFilter}
                onValueChange={setPublishedFilter}
              >
                <SelectTrigger
                  data-ocid="kb.published_select"
                  className="w-36 bg-input border-border text-sm"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Articles</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          {canManage && (
            <Button
              data-ocid="kb.primary_button"
              onClick={() => setShowCreate(true)}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Article
            </Button>
          )}
        </div>

        {/* Articles */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="kb.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <BookOpen className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              No articles found
            </p>
            <p className="text-xs text-muted-foreground/60">
              {searchQuery ||
              categoryFilter !== "all" ||
              publishedFilter !== "all"
                ? "Try adjusting your filters"
                : canManage
                  ? 'Click "New Article" to create the first article'
                  : "No articles are published yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((article, idx) => {
              const isExpanded = expandedId === article.id.toString();
              return (
                <motion.div
                  key={article.id.toString()}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  data-ocid={`kb.item.${idx + 1}`}
                >
                  <Card className="bg-card border-border hover:border-primary/20 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleViewArticle(article)}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left line-clamp-1"
                          >
                            {article.title}
                          </button>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <Badge
                              variant="outline"
                              className="text-xs bg-primary/5 text-primary border-primary/20"
                            >
                              {article.category}
                            </Badge>
                            {article.isPublished ? (
                              <span className="text-xs text-emerald-400 flex items-center gap-1">
                                <Eye className="h-3 w-3" /> Published
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <EyeOff className="h-3 w-3" /> Draft
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.viewCount.toString()} views
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`kb.view_button.${idx + 1}`}
                            onClick={() => handleViewArticle(article)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`kb.expand_button.${idx + 1}`}
                            onClick={() =>
                              setExpandedId(
                                isExpanded ? null : article.id.toString(),
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
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                data-ocid={`kb.toggle_button.${idx + 1}`}
                                onClick={() => handleTogglePublish(article)}
                                disabled={updateArticle.isPending}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                              >
                                {article.isPublished ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                data-ocid={`kb.edit_button.${idx + 1}`}
                                onClick={() => setEditArticle(article)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                data-ocid={`kb.delete_button.${idx + 1}`}
                                onClick={() => setDeleteId(article.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
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
                            <p className="text-xs text-foreground/80 whitespace-pre-wrap line-clamp-5 leading-relaxed bg-muted/20 rounded-lg p-3 border border-border">
                              {article.content}
                            </p>
                            {article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {article.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                                  >
                                    <Tag className="h-2.5 w-2.5" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <Button
                              size="sm"
                              variant="link"
                              onClick={() => handleViewArticle(article)}
                              className="mt-2 h-auto p-0 text-xs text-primary"
                            >
                              Read full article →
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
          data-ocid="kb.create_dialog"
          className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              New Article
            </DialogTitle>
          </DialogHeader>
          <ArticleForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isPending={createArticle.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editArticle}
        onOpenChange={(o) => {
          if (!o) setEditArticle(null);
        }}
      >
        <DialogContent
          data-ocid="kb.edit_dialog"
          className="sm:max-w-[700px] bg-card border-border max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Edit Article
            </DialogTitle>
          </DialogHeader>
          {editArticle && (
            <ArticleForm
              article={editArticle}
              onSubmit={handleUpdate}
              onCancel={() => setEditArticle(null)}
              isPending={updateArticle.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <ArticleViewDialog
        articleId={viewArticleId}
        open={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setViewArticleId(null);
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
          data-ocid="kb.delete_dialog"
          className="sm:max-w-[400px] bg-card border-border"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-base">
              Delete Article?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This article will be permanently deleted and cannot be recovered.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              data-ocid="kb.delete_cancel_button"
              onClick={() => setDeleteId(null)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              data-ocid="kb.delete_confirm_button"
              onClick={handleDelete}
              disabled={deleteArticle.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteArticle.isPending && (
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
