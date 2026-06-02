import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string | boolean;
  label?: string;
};

function normalizeStatus(status: string | boolean) {
  if (typeof status === "boolean") {
    return status ? "active" : "inactive";
  }

  return status;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status);

  const successStatuses = [
    "active",
    "paid",
    "confirmed",
    "completed",
    "success",
    "ready",
  ];

  const dangerStatuses = [
    "inactive",
    "cancelled",
    "refunded",
    "failed",
    "expired",
  ];

  const warningStatuses = [
    "pending",
    "pending_payment",
    "waiting_confirmation",
    "processing",
    "shipped",
  ];

  const variant = successStatuses.includes(normalizedStatus)
    ? "success"
    : dangerStatuses.includes(normalizedStatus)
      ? "danger"
      : warningStatuses.includes(normalizedStatus)
        ? "warning"
        : "default";

  return <Badge variant={variant}>{label ?? normalizedStatus}</Badge>;
}