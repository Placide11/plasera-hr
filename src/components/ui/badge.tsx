import { cn } from "@/lib/utils";

const EMPLOYMENT_STYLES: Record<string, string> = {
  ACTIVE: "bg-status-active-soft text-status-active",
  ON_LEAVE: "bg-status-leave-soft text-status-leave",
  INACTIVE: "bg-status-inactive-soft text-status-inactive",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On leave",
  INACTIVE: "Inactive",
};

const LEAVE_STYLES: Record<string, string> = {
  PENDING: "bg-status-leave-soft text-status-leave",
  APPROVED: "bg-status-active-soft text-status-active",
  REJECTED: "bg-status-rejected-soft text-status-rejected",
};

const LEAVE_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function StatusBadge({
  status,
  kind = "employment",
  className,
}: {
  status: string;
  kind?: "employment" | "leave";
  className?: string;
}) {
  const styles = kind === "employment" ? EMPLOYMENT_STYLES : LEAVE_STYLES;
  const labels = kind === "employment" ? EMPLOYMENT_LABELS : LEAVE_LABELS;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] ?? status}
    </span>
  );
}
