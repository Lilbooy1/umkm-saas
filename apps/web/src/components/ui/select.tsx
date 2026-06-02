import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
};

export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <div>
      <select
        className={cn(
          "w-full rounded-2xl border bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-white",
          error ? "border-red-500/50" : "border-zinc-700",
          className,
        )}
        {...props}
      >
        {children}
      </select>

      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}