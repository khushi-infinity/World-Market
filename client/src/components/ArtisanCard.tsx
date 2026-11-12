import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { UserSummary } from "../lib/types";
import { money } from "../lib/api";
import { RegionBadge } from "./RegionBadge";
import { SigilAvatar } from "./SigilAvatar";
import { StarRating } from "./StarRating";

export function ArtisanCard({ artisan }: { artisan: UserSummary }) {
  return (
    <Link to={`/artisans/${artisan.handle}`} className="panel panel-hover group flex flex-col p-5">
      <div className="flex items-start gap-3.5">
        <SigilAvatar name={artisan.name} color={artisan.avatarColor} size={52} verified={artisan.verified} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[1rem] text-parchment transition group-hover:text-gold-2">
            {artisan.name}
          </h3>
          <p className="mt-0.5 truncate text-[11px] text-parchment/45">{artisan.title}</p>
          <div className="mt-1.5">
            <StarRating rating={artisan.rating} count={artisan.reviewsCount} showValue />
          </div>
        </div>
        <ArrowUpRight
          size={16}
          className="text-parchment/20 transition group-hover:text-gold"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {artisan.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="tag">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-parchment/8 pt-3.5 text-[10px]">
        <RegionBadge region={artisan.region} short />
        <span className="inline-flex items-center gap-1 text-parchment/35">
          <MapPin size={10} />
          {artisan.location}
        </span>
        <span className="font-display text-[11px] text-gold-2">{money(artisan.hourlyRate)} / hr</span>
      </div>
    </Link>
  );
}
