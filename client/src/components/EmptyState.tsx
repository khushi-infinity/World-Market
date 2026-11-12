import type { ReactNode } from "react";
import { Sigil } from "./Logo";

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="panel-soft flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 opacity-40">{icon ?? <Sigil size={34} />}</div>
      <h3 className="font-display text-lg text-parchment/85">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-parchment/45">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="panel p-5">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton mt-4 h-5 w-4/5" />
      <div className="skeleton mt-3 h-3 w-full" />
      <div className="skeleton mt-2 h-3 w-2/3" />
      <div className="mt-5 flex gap-2">
        <div className="skeleton h-6 w-16" />
        <div className="skeleton h-6 w-20" />
      </div>
    </div>
  );
}

export function LoadingHall({ label = "Opening the hall" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <span className="oracle-orb scale-75">
        <Sigil size={26} />
      </span>
      <p className="eyebrow eyebrow-dim">{label}</p>
    </div>
  );
}
