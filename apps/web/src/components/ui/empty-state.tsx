import { ReactNode } from "react";
import { SectionCard } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <SectionCard className="p-8 text-center">
      <h2 className="text-xl font-semibold text-white">{title}</h2>

      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </SectionCard>
  );
}