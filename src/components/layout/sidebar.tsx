"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarClock,
  LayoutDashboard,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/departments", label: "Departments", icon: Building2 },
  { href: "/leave", label: "Leave", icon: CalendarClock },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-line bg-panel">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink text-sm font-display font-medium text-paper">
            P
          </span>
          <span className="font-display text-lg font-medium text-ink">
            Plasera HR
          </span>
        </Link>
        <button
          onClick={onNavigate}
          className="text-ink-soft md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-sm border-l-2 border-transparent px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-stone hover:text-ink",
                active && "border-brand bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="text-xs text-ink-soft">Signed in as</p>
        <p className="text-sm font-medium text-ink">HR Admin</p>
      </div>
    </div>
  );
}
