import { Link } from "react-router-dom";
import { Clock, Coins, ScrollText, Users } from "lucide-react";
import type { Job } from "../lib/types";
import { gold, timeAgo } from "../lib/api";
import { RegionBadge } from "./RegionBadge";
import { StatusBadge } from "./StatusBadge";

export function JobCard({ job, compact = false }: { job: Job; compact?: boolean }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className={`panel panel-hover group block ${compact ? "p-4" : "p-5"} ${job.featured ? "border-gold/30" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <RegionBadge region={job.region} />
        <div className="flex items-center gap-2">
          {job.featured && (
            <span className="text-[9px] uppercase tracking-[0.18em] text-gold/80">Chosen decree</span>
          )}
          <StatusBadge status={job.status} />
        </div>
      </div>

      <h3 className="mt-3 font-display text-[1.02rem] leading-snug text-parchment transition group-hover:text-gold-2">
        {job.title}
      </h3>

      {!compact && (
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-parchment/48">{job.description}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="tag">
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && <span className="tag">+{job.skills.length - 4}</span>}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-parchment/8 pt-3.5">
        <span className="inline-flex items-center gap-1.5 font-display text-sm text-gold-2">
          <Coins size={13} />
          {gold(job.budgetMin)} to {gold(job.budgetMax)}
          <span className="ml-0.5 text-[9px] uppercase tracking-wider text-parchment/35">
            {job.budgetType === "HOURLY" ? "/ hr" : "fixed"}
          </span>
        </span>
        <span className="flex items-center gap-3 text-[10px] text-parchment/35">
          <span className="inline-flex items-center gap-1">
            <Users size={11} /> {job.proposalsCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} /> {timeAgo(job.createdAt)}
          </span>
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-parchment/30">
        <ScrollText size={10} />
        Posted by {job.patron.name}
      </div>
    </Link>
  );
}
