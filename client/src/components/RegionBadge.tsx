import { regionByName } from "../lib/regions";

export function RegionBadge({ region, short = false }: { region: string; short?: boolean }) {
  const info = regionByName(region);
  const Icon = info.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-parchment/55">
      <span style={{ color: info.accent }}>
        <Icon size={12} strokeWidth={1.6} />
      </span>
      {short ? info.short : info.name}
    </span>
  );
}
