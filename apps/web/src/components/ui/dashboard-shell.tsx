import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type DashboardShellProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <main className={cn("min-h-screen bg-zinc-950 px-6 py-10 text-white", className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}