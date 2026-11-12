import { Star } from "lucide-react";

export function StarRating({
  rating,
  count,
  size = 13,
  showValue = false,
}: {
  rating: number;
  count?: number;
  size?: number;
  showValue?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className="inline-flex items-center gap-1.5" title={`${rating.toFixed(1)} out of 5`}>
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex gap-0.5 text-parchment/15">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={size} strokeWidth={1.2} />
          ))}
        </span>
        <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
          <span className="flex w-max gap-0.5 text-gold">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={size} strokeWidth={1.2} fill="currentColor" />
            ))}
          </span>
        </span>
      </span>
      {showValue && <span className="text-[11px] text-parchment/70">{rating.toFixed(1)}</span>}
      {count !== undefined && <span className="text-[10px] text-parchment/35">({count})</span>}
    </span>
  );
}
