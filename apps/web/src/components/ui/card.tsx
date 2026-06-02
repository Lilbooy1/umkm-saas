import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-zinc-800 bg-zinc-900 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function SectionCard({ className, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-950 p-5",
        className,
      )}
      {...props}
    />
  );
}