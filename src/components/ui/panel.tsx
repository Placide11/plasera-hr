import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-sm border border-line bg-panel", className)}>
      {children}
    </div>
  );
}

export function StatPanel({
  label,
  value,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  accent?: "brand" | "active" | "leave" | "inactive";
}) {
  const accentColor = {
    brand: "var(--color-brand)",
    active: "var(--color-status-active)",
    leave: "var(--color-status-leave)",
    inactive: "var(--color-status-inactive)",
  }[accent];

  return (
    <div
      className="border-l-2 border-t border-r border-b border-line bg-panel py-3.5 pr-4 pl-4"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
    >
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1.5 font-display text-3xl font-medium text-ink">
        {value}
      </p>
    </div>
  );
}
