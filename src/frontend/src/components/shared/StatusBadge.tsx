import { TicketPriority, TicketStatus } from "../../backend.d";

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const styles: Record<TicketStatus, string> = {
    [TicketStatus.Open]: "status-badge-open",
    [TicketStatus.InProgress]: "status-badge-inprogress",
    [TicketStatus.Resolved]: "status-badge-resolved",
    [TicketStatus.Closed]: "status-badge-closed",
  };

  const labels: Record<TicketStatus, string> = {
    [TicketStatus.Open]: "Open",
    [TicketStatus.InProgress]: "In Progress",
    [TicketStatus.Resolved]: "Resolved",
    [TicketStatus.Closed]: "Closed",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}

export function PriorityBadge({
  priority,
  className = "",
}: PriorityBadgeProps) {
  const styles: Record<TicketPriority, string> = {
    [TicketPriority.Critical]: "priority-badge-critical",
    [TicketPriority.High]: "priority-badge-high",
    [TicketPriority.Medium]: "priority-badge-medium",
    [TicketPriority.Low]: "priority-badge-low",
  };

  const dots: Record<TicketPriority, string> = {
    [TicketPriority.Critical]: "●",
    [TicketPriority.High]: "●",
    [TicketPriority.Medium]: "●",
    [TicketPriority.Low]: "●",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styles[priority]} ${className}`}
    >
      <span className="text-[8px]">{dots[priority]}</span>
      {priority}
    </span>
  );
}
