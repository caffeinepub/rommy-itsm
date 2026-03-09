import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import type { Principal } from "@icp-sdk/core/principal";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit3,
  Loader2,
  MapPin,
  Package,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AssetStatus, AssetType, UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import {
  useAllUsers,
  useAsset,
  useDeleteAsset,
  useMyProfile,
  useUpdateAsset,
  useUpdateAssetStatus,
} from "../hooks/useQueries";
import { AssetStatusBadge, AssetTypeBadge } from "./AssetsPage";

const statusOptions = [
  { value: AssetStatus.Active, label: "Active" },
  { value: AssetStatus.Inactive, label: "Inactive" },
  { value: AssetStatus.Maintenance, label: "Maintenance" },
  { value: AssetStatus.Retired, label: "Retired" },
  { value: AssetStatus.Disposed, label: "Disposed" },
];

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <div className="text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function AssetDetailPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const assetId = params.id ? BigInt(params.id) : null;
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAssetType, setEditAssetType] = useState<AssetType | "">("");
  const [editStatus, setEditStatus] = useState<AssetStatus | "">("");
  const [editAssetTag, setEditAssetTag] = useState("");
  const [editManufacturer, setEditManufacturer] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editSerialNumber, setEditSerialNumber] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAssignee, setEditAssignee] = useState("unassigned");
  const [editCost, setEditCost] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data: asset, isLoading } = useAsset(assetId);
  const { data: profile } = useMyProfile();
  const { data: allUsers } = useAllUsers();
  const updateAsset = useUpdateAsset();
  const updateAssetStatus = useUpdateAssetStatus();
  const deleteAsset = useDeleteAsset();

  const canManage =
    profile?.role === UserRole.ITAgent ||
    profile?.role === UserRole.Manager ||
    profile?.role === UserRole.MasterAdmin;

  const handleStartEdit = () => {
    if (!asset) return;
    setEditName(asset.name);
    setEditAssetType(asset.assetType);
    setEditStatus(asset.status);
    setEditAssetTag(asset.assetTag);
    setEditManufacturer(asset.manufacturer ?? "");
    setEditModel(asset.model ?? "");
    setEditSerialNumber(asset.serialNumber ?? "");
    setEditLocation(asset.location ?? "");
    setEditAssignee(asset.assignedTo?.toString() ?? "unassigned");
    setEditCost(asset.cost ? (Number(asset.cost) / 100).toFixed(2) : "");
    setEditDescription(asset.description ?? "");
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!asset || !editAssetType || !editStatus) return;

    const costValue = editCost.trim()
      ? BigInt(Math.round(Number.parseFloat(editCost) * 100))
      : null;

    const assignedToUser =
      editAssignee !== "unassigned"
        ? allUsers?.find((u) => u.principal.toString() === editAssignee)
        : null;

    try {
      await updateAsset.mutateAsync({
        id: asset.id,
        name: editName.trim(),
        assetType: editAssetType as AssetType,
        status: editStatus as AssetStatus,
        assetTag: editAssetTag.trim(),
        manufacturer: editManufacturer.trim() || null,
        model: editModel.trim() || null,
        serialNumber: editSerialNumber.trim() || null,
        location: editLocation.trim() || null,
        assignedTo: (assignedToUser?.principal as Principal) ?? null,
        purchaseDate: asset.purchaseDate ?? null,
        warrantyExpiry: asset.warrantyExpiry ?? null,
        cost: costValue,
        description: editDescription.trim() || null,
      });
      toast.success("Asset updated successfully");
      setEditMode(false);
    } catch {
      toast.error("Failed to update asset");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!asset) return;
    try {
      await updateAssetStatus.mutateAsync({
        id: asset.id,
        status: newStatus as AssetStatus,
      });
      toast.success("Asset status updated");
    } catch {
      toast.error("Failed to update asset status");
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    try {
      await deleteAsset.mutateAsync(asset.id);
      toast.success("Asset deleted");
      navigate({ to: "/assets" });
    } catch {
      toast.error("Failed to delete asset");
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Asset Detail">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!asset) {
    return (
      <AppLayout title="Asset Not Found">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">
            Asset Not Found
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            The requested asset could not be found.
          </p>
          <Link to="/assets">
            <Button variant="outline" className="border-border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assets
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const assignedUser = allUsers?.find(
    (u) => u.principal.toString() === asset.assignedTo?.toString(),
  );

  const formatDate = (ns: bigint) =>
    new Date(Number(ns) / 1_000_000).toLocaleDateString();

  return (
    <AppLayout title="Asset Detail">
      <div
        data-ocid="asset_detail.page"
        className="max-w-4xl mx-auto space-y-5 animate-fade-in"
      >
        {/* Back link */}
        <Link
          to="/assets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Assets
        </Link>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      #{asset.id.toString()}
                    </span>
                    <span className="font-mono text-xs bg-muted/50 text-foreground px-2 py-0.5 rounded border border-border">
                      {asset.assetTag}
                    </span>
                    <AssetTypeBadge assetType={asset.assetType} />
                    <AssetStatusBadge status={asset.status} />
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                    {asset.name}
                  </h2>
                </div>
                {canManage && (
                  <div className="flex gap-2 flex-shrink-0">
                    {!editMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        data-ocid="asset_detail.edit_button"
                        onClick={handleStartEdit}
                        className="border-border text-xs"
                      >
                        <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          data-ocid="asset_detail.delete_button"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent
                        data-ocid="asset_detail.dialog"
                        className="bg-card border-border"
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display">
                            Delete Asset
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{asset.name}</strong>? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            data-ocid="asset_detail.cancel_button"
                            className="border-border"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            data-ocid="asset_detail.confirm_button"
                            onClick={handleDelete}
                            disabled={deleteAsset.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteAsset.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Delete Asset
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details / Edit form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Asset Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Asset Tag *</Label>
                      <Input
                        value={editAssetTag}
                        onChange={(e) => setEditAssetTag(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Asset Type</Label>
                      <Select
                        value={editAssetType}
                        onValueChange={(v) => setEditAssetType(v as AssetType)}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value={AssetType.Hardware}>
                            Hardware
                          </SelectItem>
                          <SelectItem value={AssetType.Software}>
                            Software
                          </SelectItem>
                          <SelectItem value={AssetType.Network}>
                            Network
                          </SelectItem>
                          <SelectItem value={AssetType.Service}>
                            Service
                          </SelectItem>
                          <SelectItem value={AssetType.Other}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={editStatus}
                        onValueChange={(v) => setEditStatus(v as AssetStatus)}
                      >
                        <SelectTrigger className="bg-input border-border">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Manufacturer</Label>
                      <Input
                        value={editManufacturer}
                        onChange={(e) => setEditManufacturer(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input
                        value={editModel}
                        onChange={(e) => setEditModel(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Serial Number</Label>
                      <Input
                        value={editSerialNumber}
                        onChange={(e) => setEditSerialNumber(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Select
                        value={editAssignee}
                        onValueChange={setEditAssignee}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="unassigned">
                            — Unassigned —
                          </SelectItem>
                          {allUsers?.map((u) => (
                            <SelectItem
                              key={u.principal.toString()}
                              value={u.principal.toString()}
                            >
                              {u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cost (USD)</Label>
                      <Input
                        type="number"
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="bg-input border-border resize-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(false)}
                      className="border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      data-ocid="asset_detail.save_button"
                      onClick={handleSaveEdit}
                      disabled={updateAsset.isPending}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {updateAsset.isPending ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-3.5 w-3.5" />
                      )}
                      {updateAsset.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="divide-y-0">
                  <DetailRow
                    icon={<Package className="h-4 w-4" />}
                    label="Type"
                    value={<AssetTypeBadge assetType={asset.assetType} />}
                  />
                  <Separator className="bg-border/50" />
                  <DetailRow
                    icon={<Package className="h-4 w-4" />}
                    label="Manufacturer / Model"
                    value={
                      asset.manufacturer || asset.model
                        ? `${asset.manufacturer ?? ""} ${asset.model ?? ""}`.trim()
                        : "—"
                    }
                  />
                  <Separator className="bg-border/50" />
                  <DetailRow
                    icon={<Package className="h-4 w-4" />}
                    label="Serial Number"
                    value={
                      asset.serialNumber ? (
                        <code className="font-mono text-xs bg-muted/50 px-1.5 py-0.5 rounded">
                          {asset.serialNumber}
                        </code>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <Separator className="bg-border/50" />
                  <DetailRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Location"
                    value={asset.location ?? "—"}
                  />
                  <Separator className="bg-border/50" />
                  <DetailRow
                    icon={<User className="h-4 w-4" />}
                    label="Assigned To"
                    value={
                      assignedUser ? (
                        <span className="font-medium">{assignedUser.name}</span>
                      ) : (
                        <span className="text-muted-foreground/60 italic">
                          Unassigned
                        </span>
                      )
                    }
                  />
                  <Separator className="bg-border/50" />
                  <DetailRow
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Cost"
                    value={
                      asset.cost
                        ? `$${(Number(asset.cost) / 100).toFixed(2)}`
                        : "—"
                    }
                  />
                  {asset.purchaseDate && (
                    <>
                      <Separator className="bg-border/50" />
                      <DetailRow
                        icon={<Calendar className="h-4 w-4" />}
                        label="Purchase Date"
                        value={formatDate(asset.purchaseDate)}
                      />
                    </>
                  )}
                  {asset.warrantyExpiry && (
                    <>
                      <Separator className="bg-border/50" />
                      <DetailRow
                        icon={<Calendar className="h-4 w-4" />}
                        label="Warranty Expiry"
                        value={formatDate(asset.warrantyExpiry)}
                      />
                    </>
                  )}
                  <Separator className="bg-border/50" />
                  <DetailRow
                    icon={<Clock className="h-4 w-4" />}
                    label="Created"
                    value={formatDate(asset.createdAt)}
                  />
                  <Separator className="bg-border/50" />
                  <DetailRow
                    icon={<Clock className="h-4 w-4" />}
                    label="Updated"
                    value={formatDate(asset.updatedAt)}
                  />
                  {asset.description && (
                    <>
                      <Separator className="bg-border/50" />
                      <DetailRow
                        icon={<Package className="h-4 w-4" />}
                        label="Description"
                        value={
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {asset.description}
                          </p>
                        }
                      />
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick status update */}
        {canManage && !editMode && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-sm font-semibold">
                  Quick Status Update
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Select
                    value={asset.status}
                    onValueChange={handleStatusChange}
                    disabled={updateAssetStatus.isPending}
                  >
                    <SelectTrigger
                      data-ocid="asset_detail.status_select"
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
                  {updateAssetStatus.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
