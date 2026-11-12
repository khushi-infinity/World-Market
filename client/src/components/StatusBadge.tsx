import { statusLabel, statusTone } from "../lib/api";

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const tone = statusTone(status);
  return <span className={`badge badge-${tone} ${className}`}>{statusLabel(status)}</span>;
}
