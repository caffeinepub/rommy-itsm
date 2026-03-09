import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TicketPriority, TicketType } from "../../backend.d";
import { useCreateTicket } from "../../hooks/useQueries";

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  ticketType: TicketType;
}

export function CreateTicketModal({
  open,
  onClose,
  ticketType,
}: CreateTicketModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<TicketPriority | "">("");

  const createTicket = useCreateTicket();

  const typeLabel =
    ticketType === TicketType.Incident ? "Incident" : "Service Request";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category.trim() || !priority) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createTicket.mutateAsync({
        ticketType,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority: priority as TicketPriority,
      });
      toast.success(`${typeLabel} created successfully`);
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("");
      onClose();
    } catch {
      toast.error(`Failed to create ${typeLabel.toLowerCase()}`);
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
      <DialogContent className="sm:max-w-[560px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            New {typeLabel}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              data-ocid="create_ticket.title_input"
              placeholder={`Brief description of the ${typeLabel.toLowerCase()}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              data-ocid="create_ticket.description_textarea"
              placeholder="Provide detailed information..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-input border-border resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                data-ocid="create_ticket.category_input"
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
                  data-ocid="create_ticket.priority_select"
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
              data-ocid="create_ticket.cancel_button"
              onClick={handleClose}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="create_ticket.submit_button"
              disabled={createTicket.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createTicket.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {createTicket.isPending ? "Creating..." : `Create ${typeLabel}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
