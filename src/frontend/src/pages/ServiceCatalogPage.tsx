import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
  CheckCircle2,
  Clock,
  Edit,
  Loader2,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ServiceCatalogItem } from "../backend.d";
import { UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import {
  useCreateServiceCatalogItem,
  useDeleteServiceCatalogItem,
  useListServiceCatalogItems,
  useMyProfile,
  useRequestFromCatalog,
  useUpdateServiceCatalogItem,
} from "../hooks/useQueries";

const STAFF_ROLES = [UserRole.ITAgent, UserRole.Manager, UserRole.MasterAdmin];

function CatalogItemForm({
  item,
  onSubmit,
  onCancel,
  isPending,
}: {
  item?: ServiceCatalogItem;
  onSubmit: (data: {
    name: string;
    category: string;
    description: string;
    slaInfo: string;
    isAvailable: boolean;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [slaInfo, setSlaInfo] = useState(item?.slaInfo ?? "");
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !description.trim()) {
      toast.error("Name, category, and description are required");
      return;
    }
    onSubmit({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      slaInfo: slaInfo.trim(),
      isAvailable,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sc-name">Service Name *</Label>
          <Input
            id="sc-name"
            data-ocid="catalog.name_input"
            placeholder="e.g. Laptop Provisioning"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sc-category">Category *</Label>
          <Input
            id="sc-category"
            data-ocid="catalog.category_input"
            placeholder="e.g. Hardware, Software..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-input border-border"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sc-desc">Description *</Label>
        <Textarea
          id="sc-desc"
          data-ocid="catalog.textarea"
          placeholder="Describe this service..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="bg-input border-border resize-none"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sc-sla">SLA Information</Label>
        <Input
          id="sc-sla"
          data-ocid="catalog.sla_input"
          placeholder="e.g. Response: 4h, Resolution: 1 business day"
          value={slaInfo}
          onChange={(e) => setSlaInfo(e.target.value)}
          className="bg-input border-border"
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="sc-available"
          data-ocid="catalog.switch"
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
        />
        <Label htmlFor="sc-available" className="cursor-pointer">
          Available for requests
        </Label>
      </div>
      <DialogFooter className="gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          data-ocid="catalog.cancel_button"
          onClick={onCancel}
          className="border-border"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          data-ocid="catalog.submit_button"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : item ? "Update Service" : "Create Service"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function RequestServiceDialog({
  item,
  open,
  onClose,
}: {
  item: ServiceCatalogItem;
  open: boolean;
  onClose: () => void;
}) {
  const [details, setDetails] = useState("");
  const requestFromCatalog = useRequestFromCatalog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      toast.error("Please provide request details");
      return;
    }
    try {
      await requestFromCatalog.mutateAsync({
        itemId: item.id,
        details: details.trim(),
      });
      toast.success("Service request submitted successfully");
      setDetails("");
      onClose();
    } catch {
      toast.error("Failed to submit service request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-ocid="catalog.dialog"
        className="sm:max-w-[500px] bg-card border-border"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Request Service
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{item.name}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              SLA
            </p>
            <p className="text-sm text-foreground">
              {item.slaInfo || "Standard SLA applies"}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="req-details">Request Details *</Label>
            <Textarea
              id="req-details"
              data-ocid="catalog.request_textarea"
              placeholder="Describe your requirements, business justification, timeline..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="bg-input border-border resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="catalog.request_cancel_button"
              onClick={onClose}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="catalog.request_submit_button"
              disabled={requestFromCatalog.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {requestFromCatalog.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {requestFromCatalog.isPending
                ? "Submitting..."
                : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceCatalogPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<ServiceCatalogItem | null>(null);
  const [requestItem, setRequestItem] = useState<ServiceCatalogItem | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availFilter, setAvailFilter] = useState("all");

  const { data: profile } = useMyProfile();
  const canManage = profile?.role && STAFF_ROLES.includes(profile.role);

  const filter = {
    ...(availFilter === "available" && { isAvailable: true }),
    ...(availFilter === "unavailable" && { isAvailable: false }),
    ...(categoryFilter !== "all" && { category: categoryFilter }),
  };

  const { data: items, isLoading } = useListServiceCatalogItems(filter);
  const createItem = useCreateServiceCatalogItem();
  const updateItem = useUpdateServiceCatalogItem();
  const deleteItem = useDeleteServiceCatalogItem();

  const categories = [...new Set(items?.map((i) => i.category) ?? [])].sort();

  const filtered =
    items?.filter((i) =>
      searchQuery
        ? i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    ) ?? [];

  const handleCreate = async (data: {
    name: string;
    category: string;
    description: string;
    slaInfo: string;
    isAvailable: boolean;
  }) => {
    try {
      await createItem.mutateAsync(data);
      toast.success("Service created successfully");
      setShowCreate(false);
    } catch {
      toast.error("Failed to create service");
    }
  };

  const handleUpdate = async (data: {
    name: string;
    category: string;
    description: string;
    slaInfo: string;
    isAvailable: boolean;
  }) => {
    if (!editItem) return;
    try {
      await updateItem.mutateAsync({ id: editItem.id, ...data });
      toast.success("Service updated successfully");
      setEditItem(null);
    } catch {
      toast.error("Failed to update service");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteItem.mutateAsync(deleteId);
      toast.success("Service deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete service");
    }
  };

  return (
    <AppLayout title="Service Catalog">
      <div data-ocid="catalog.page" className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="catalog.search_input"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-52 bg-input border-border text-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger
                data-ocid="catalog.category_select"
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
            <Select value={availFilter} onValueChange={setAvailFilter}>
              <SelectTrigger
                data-ocid="catalog.avail_select"
                className="w-36 bg-input border-border text-sm"
              >
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {canManage && (
            <Button
              data-ocid="catalog.primary_button"
              onClick={() => setShowCreate(true)}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Service
            </Button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="catalog.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              No services found
            </p>
            <p className="text-xs text-muted-foreground/60">
              {searchQuery || categoryFilter !== "all" || availFilter !== "all"
                ? "Try adjusting your filters"
                : canManage
                  ? 'Click "Add Service" to create the first catalog item'
                  : "No services are available yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id.toString()}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                data-ocid={`catalog.item.${idx + 1}`}
              >
                <Card className="bg-card border-border h-full flex flex-col hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
                          {item.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="mt-1.5 text-xs bg-primary/5 text-primary border-primary/20"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex-shrink-0">
                        {item.isAvailable ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5" />
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-3">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {item.description}
                    </p>
                    {item.slaInfo && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{item.slaInfo}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 gap-2">
                    <Button
                      size="sm"
                      data-ocid={`catalog.request_button.${idx + 1}`}
                      disabled={!item.isAvailable}
                      onClick={() => setRequestItem(item)}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8"
                    >
                      Request Service
                    </Button>
                    {canManage && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          data-ocid={`catalog.edit_button.${idx + 1}`}
                          onClick={() => setEditItem(item)}
                          className="h-8 w-8 p-0 border-border"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-ocid={`catalog.delete_button.${idx + 1}`}
                          onClick={() => setDeleteId(item.id)}
                          className="h-8 w-8 p-0 border-border text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent
          data-ocid="catalog.create_dialog"
          className="sm:max-w-[560px] bg-card border-border"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              New Service
            </DialogTitle>
          </DialogHeader>
          <CatalogItemForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            isPending={createItem.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editItem}
        onOpenChange={(o) => {
          if (!o) setEditItem(null);
        }}
      >
        <DialogContent
          data-ocid="catalog.edit_dialog"
          className="sm:max-w-[560px] bg-card border-border"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Edit Service
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <CatalogItemForm
              item={editItem}
              onSubmit={handleUpdate}
              onCancel={() => setEditItem(null)}
              isPending={updateItem.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <DialogContent
          data-ocid="catalog.delete_dialog"
          className="sm:max-w-[400px] bg-card border-border"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-base">
              Delete Service?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The service will be permanently
            removed from the catalog.
          </p>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              data-ocid="catalog.delete_cancel_button"
              onClick={() => setDeleteId(null)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              data-ocid="catalog.delete_confirm_button"
              onClick={handleDelete}
              disabled={deleteItem.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteItem.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Dialog */}
      {requestItem && (
        <RequestServiceDialog
          item={requestItem}
          open={!!requestItem}
          onClose={() => setRequestItem(null)}
        />
      )}
    </AppLayout>
  );
}
