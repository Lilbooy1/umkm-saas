import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant =
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "muted";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-zinc-800 text-zinc-300",
  success: "bg-emerald-500/10 text-emerald-300",
  danger: "bg-red-500/10 text-red-300",
  warning: "bg-amber-500/10 text-amber-300",
  info: "bg-sky-500/10 text-sky-300",
  muted: "bg-zinc-900 text-zinc-500",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}