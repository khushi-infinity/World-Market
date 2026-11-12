import { Link } from "react-router-dom";

export function Sigil({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="sigil-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0d79a" />
          <stop offset="0.55" stopColor="#c9a227" />
          <stop offset="1" stopColor="#8a6d3b" />
        </linearGradient>
      </defs>
      <path
        d="M32 5 39 24 59 24 43 36 49 56 32 44 15 56 21 36 5 24 25 24Z"
        fill="none"
        stroke="url(#sigil-gold)"
        strokeWidth="2"
        opacity="0.9"
      />
      <path
        d="M32 20c4.5 5.5 6.8 9.6 6.8 13.4a6.8 6.8 0 0 1-13.6 0c0-3.8 2.3-7.9 6.8-13.4Z"
        fill="url(#sigil-gold)"
      />
      <circle cx="32" cy="34" r="2.1" fill="#0a0908" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3" aria-label="Emberhall home">
      <span className="transition-transform duration-500 group-hover:rotate-[8deg]">
        <Sigil size={compact ? 32 : 38} />
      </span>
      <span className="leading-none">
        <span
          className="block font-display text-[1.02rem] font-semibold tracking-[0.22em] text-parchment sm:text-[1.12rem]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          EMBERHALL
        </span>
        {!compact && (
          <span className="mt-1 block text-[7.5px] font-medium tracking-[0.42em] text-gold/70">
            GUILD MARKET
          </span>
        )}
      </span>
    </Link>
  );
}
