import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <div>
      <textarea
        className={cn(
          "min-h-32 w-full rounded-2xl border bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white",
          error ? "border-red-500/50" : "border-zinc-700",
          className,
        )}
        {...props}
      />

      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}