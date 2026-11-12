import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-gold/12 pb-9 pt-28 sm:pt-32">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(800px 260px at 20% 0%, rgba(201,162,39,0.09), transparent 70%), radial-gradient(700px 240px at 90% 10%, rgba(140,28,28,0.1), transparent 70%)",
        }}
      />
      <div className="container-hall relative">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="display-section max-w-3xl text-parchment">{title}</h1>
        {lede && <p className="serif-lede mt-4 max-w-2xl">{lede}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </header>
  );
}
