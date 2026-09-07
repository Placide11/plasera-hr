import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-line py-16 text-center">
      <Icon className="h-8 w-8 text-ink-soft" strokeWidth={1.5} />
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
      </div>
      {action}
    </div>
  );
}
