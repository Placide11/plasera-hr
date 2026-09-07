import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none px-3.5 py-2";

const variants = {
  primary: "bg-ink text-paper hover:bg-brand",
  secondary: "bg-panel border border-line text-ink hover:border-ink",
  ghost: "text-ink-soft hover:text-ink hover:bg-stone",
  danger: "bg-panel border border-status-rejected text-status-rejected hover:bg-status-rejected-soft",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof variants;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
};

export function LinkButton({ className, variant = "primary", ...props }: LinkButtonProps) {
  return <Link className={cn(base, variants[variant], className)} {...props} />;
}
