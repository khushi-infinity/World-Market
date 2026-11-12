import { BadgeCheck } from "lucide-react";
import { initials } from "../lib/api";

interface Props {
  name: string;
  color?: string;
  size?: number;
  verified?: boolean;
  ring?: boolean;
  className?: string;
}

export function SigilAvatar({ name, color = "#c9a227", size = 48, verified, ring = true, className = "" }: Props) {
  const fontSize = Math.max(11, Math.round(size * 0.34));
  return (
    <span className={`sigil-ring ${ring ? "" : "sigil-ring-off"} ${className}`} style={{ width: size, height: size }}>
      <span
        className="sigil-fill"
        style={{
          width: size,
          height: size,
          fontSize,
          background: `linear-gradient(145deg, ${color}, ${color}cc 38%, #17120b 115%)`,
        }}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
      {verified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-ink text-gold"
          style={{ width: size * 0.34, height: size * 0.34 }}
          title="Seal verified"
        >
          <BadgeCheck size={Math.max(10, size * 0.24)} />
        </span>
      )}
    </span>
  );
}
