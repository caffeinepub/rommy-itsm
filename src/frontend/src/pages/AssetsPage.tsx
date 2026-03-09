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
import { Clock, Filter, Loader2, Package, Plus, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AssetStatus, AssetType, UserRole } from "../backend.d";
import { AppLayout } from "../components/shared/AppLayout";
import {
  useCreateAsset,
  useListAssets,
  useMyProfile,
} from "../hooks/useQueries";

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const styles: Record<AssetStatus, string> = {
    [AssetStatus.Active]:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    [AssetStatus.Inactive]:
      "bg-muted/40 text-muted-foreground border border-border",
    [AssetStatus.Maintenance]:
      "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    [AssetStatus.Retired]:
      "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    [AssetStatus.Disposed]:
      "bg-red-500/15 text-red-400 border border-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export function AssetTypeBadge({ assetType }: { assetType: AssetType }) {
  const styles: Record<AssetType, string> = {
    [AssetType.Hardware]:
      "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    [AssetType.Software]:
      "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    [AssetType.Network]:
      "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    [AssetType.Service]:
      "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    [AssetType.Other]: "bg-muted/40 text-muted-foreground border border-border",
  };

  return (
    <Badge variant="outline" className={`text-xs ${styles[assetType]}`}>
      {assetType}
    </Badge>
  );
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: AssetStatus.Active, label: "Active" },
  { value: AssetStatus.Inactive, label: "Inactive" },
  { value: AssetStatus.Maintenance, label: "Maintenance" },
  { value: AssetStatus.Retired, label: "Retired" },
  { value: AssetStatus.Disposed, label: "Disposed" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: AssetType.Hardware, label: "Hardware" },
  { value: AssetType.Software, label: "Software" },
  { value: AssetType.Network, label: "Network" },
  { value: AssetType.Service, label: "Service" },
  { value: AssetType.Other, label: "Other" },
];

function CreateAssetDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState<AssetType | "">("");
  const [status, setStatus] = useState<AssetStatus | "">("");
  const [assetTag, setAssetTag] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [location, setLocation] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");

  const createAsset = useCreateAsset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !assetType || !status || !assetTag.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const costValue = cost.trim()
      ? BigInt(Math.round(Number.parseFloat(cost) * 100))
      : null;

    try {
      await createAsset.mutateAsync({
        name: name.trim(),
        assetType: assetType as AssetType,
        status: status as AssetStatus,
        assetTag: assetTag.trim(),
        manufacturer: manufacturer.trim() || null,
        model: model.trim() || null,
        serialNumber: serialNumber.trim() || null,
        location: location.trim() || null,
        purchaseDate: null,
        warrantyExpiry: null,
        cost: costValue,
        description: description.trim() || null,
      });
      toast.success("Asset created successfully");
      setName("");
      setAssetType("");
      setStatus("");
      setAssetTag("");
      setManufacturer("");
      setModel("");
      setSerialNumber("");
      setLocation("");
      setCost("");
      setDescription("");
      onClose();
    } catch {
      toast.error("Failed to create asset");
    }
  };

  const handleClose = () => {
    setName("");
    setAssetType("");
    setStatus("");
    setAssetTag("");
    setManufacturer("");
    setModel("");
    setSerialNumber("");
    setLocation("");
    setCost("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="assets.dialog"
        className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">New Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">Name *</Label>
              <Input
                id="asset-name"
                data-ocid="assets.name_input"
                placeholder="Asset name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-tag">Asset Tag *</Label>
              <Input
                id="asset-tag"
                data-ocid="assets.tag_input"
                placeholder="e.g. ASSET-001"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Asset Type *</Label>
              <Select
                value={assetType}
                onValueChange={(v) => setAssetType(v as AssetType)}
              >
                <SelectTrigger
                  data-ocid="assets.type_select"
                  className="bg-input border-border"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value={AssetType.Hardware}>Hardware</SelectItem>
                  <SelectItem value={AssetType.Software}>Software</SelectItem>
                  <SelectItem value={AssetType.Network}>Network</SelectItem>
                  <SelectItem value={AssetType.Service}>Service</SelectItem>
                  <SelectItem value={AssetType.Other}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as AssetStatus)}
              >
                <SelectTrigger
                  data-ocid="assets.status_select"
                  className="bg-input border-border"
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value={AssetStatus.Active}>Active</SelectItem>
                  <SelectItem value={AssetStatus.Inactive}>Inactive</SelectItem>
                  <SelectItem value={AssetStatus.Maintenance}>
                    Maintenance
                  </SelectItem>
                  <SelectItem value={AssetStatus.Retired}>Retired</SelectItem>
                  <SelectItem value={AssetStatus.Disposed}>Disposed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset-mfr">Manufacturer</Label>
              <Input
                id="asset-mfr"
                placeholder="e.g. Dell, Cisco..."
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-model">Model</Label>
              <Input
                id="asset-model"
                placeholder="e.g. PowerEdge R740"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset-serial">Serial Number</Label>
              <Input
                id="asset-serial"
                placeholder="Serial number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-loc">Location</Label>
              <Input
                id="asset-loc"
                placeholder="e.g. DC-01, Floor 3..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset-cost">Cost (USD)</Label>
            <Input
              id="asset-cost"
              type="number"
              placeholder="e.g. 2499.99"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="bg-input border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asset-desc">Description</Label>
            <Textarea
              id="asset-desc"
              data-ocid="assets.description_textarea"
              placeholder="Additional notes about this asset..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-input border-border resize-none"
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="assets.cancel_button"
              onClick={handleClose}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="assets.submit_button"
              disabled={createAsset.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createAsset.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {createAsset.isPending ? "Creating..." : "Create Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssetsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profile } = useMyProfile();

  const filter = {
    ...(statusFilter !== "all" && { status: statusFilter as AssetStatus }),
    ...(typeFilter !== "all" && { assetType: typeFilter as AssetType }),
  };

  const { data: assets, isLoading } = useListAssets(filter);

  const canCreate =
    profile?.role === UserRole.ITAgent ||
    profile?.role === UserRole.Manager ||
    profile?.role === UserRole.MasterAdmin;

  const filtered =
    assets?.filter((a) =>
      searchQuery
        ? a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (a.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ??
            false)
        : true,
    ) ?? [];

  return (
    <AppLayout title="Asset Management (CMDB)">
      <div data-ocid="assets.page" className="space-y-4 animate-fade-in">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-ocid="assets.search_input"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-52 bg-input border-border text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                data-ocid="assets.status_filter_select"
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger
                data-ocid="assets.type_filter_select"
                className="w-36 bg-input border-border text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {typeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canCreate && (
            <Button
              data-ocid="assets.primary_button"
              onClick={() => setShowCreate(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Asset
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
                  data-ocid="assets.empty_state"
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <Package className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No assets found
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "Try adjusting your filters"
                      : 'Click "New Asset" to register the first asset'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="assets.table">
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs font-semibold text-muted-foreground w-16">
                          ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">
                          Name
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Asset Tag
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-24">
                          Type
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-28">
                          Location
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground w-36">
                          Manufacturer / Model
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
                      {filtered.map((asset, idx) => (
                        <TableRow
                          key={asset.id.toString()}
                          data-ocid={`assets.item.${idx + 1}`}
                          className="border-border hover:bg-accent/30"
                        >
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            #{asset.id.toString()}
                          </TableCell>
                          <TableCell>
                            <Link
                              to="/assets/$id"
                              params={{ id: asset.id.toString() }}
                              className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                            >
                              {asset.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                              {asset.assetTag}
                            </span>
                          </TableCell>
                          <TableCell>
                            <AssetTypeBadge assetType={asset.assetType} />
                          </TableCell>
                          <TableCell>
                            <AssetStatusBadge status={asset.status} />
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground truncate max-w-[80px] block">
                              {asset.location ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {asset.manufacturer && asset.model
                                ? `${asset.manufacturer} ${asset.model}`
                                : (asset.manufacturer ?? asset.model ?? "—")}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(
                                Number(asset.createdAt) / 1_000_000,
                              ).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link
                              to="/assets/$id"
                              params={{ id: asset.id.toString() }}
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

      <CreateAssetDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </AppLayout>
  );
}
