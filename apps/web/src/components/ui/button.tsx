import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "success"
  | "ghost";

type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-zinc-950 hover:bg-zinc-200 border border-white shadow-sm",
  secondary:
    "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700",
  outline:
    "bg-transparent text-zinc-200 hover:bg-zinc-800 border border-zinc-700",
  danger:
    "bg-red-500/10 text-red-300 hover:bg-red-500/15 border border-red-500/30",
  success:
    "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15 border border-emerald-500/30",
  ghost: "bg-transparent text-zinc-300 hover:bg-zinc-800 border border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  );
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })}>
      {children}
    </Link>
  );
}