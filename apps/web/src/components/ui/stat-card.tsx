import { ReactNode } from "react";
import { SectionCard } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: ReactNode;
  description?: string;
};

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <SectionCard>
      <p className="text-sm text-zinc-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-white">{value}</p>

      {description ? (
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      ) : null}
    </SectionCard>
  );
}