import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="text-sm font-medium text-zinc-400">{eyebrow}</p>
        ) : null}

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}