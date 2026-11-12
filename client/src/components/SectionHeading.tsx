import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-5 ${
        align === "center" ? "items-center text-center" : "items-start md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h2 className="display-section text-parchment">{title}</h2>
        {lede && <p className={`serif-lede mt-4 ${align === "center" ? "mx-auto" : ""}`}>{lede}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Rule({ className = "" }: { className?: string }) {
  return (
    <div className={`rule-mark ${className}`} aria-hidden="true">
      <span />
    </div>
  );
}
