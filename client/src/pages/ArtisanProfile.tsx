import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Coins,
  MapPin,
  MessageSquare,
  ScrollText,
  Sparkles,
  Star,
} from "lucide-react";
import { api, dateLabel, money } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import type { ArtisanProfile, Conversation } from "../lib/types";
import { SigilAvatar } from "../components/SigilAvatar";
import { StarRating } from "../components/StarRating";
import { RegionBadge } from "../components/RegionBadge";
import { JobCard } from "../components/JobCard";
import { LoadingHall, EmptyState } from "../components/EmptyState";

export function ArtisanProfilePage() {
  const { handle } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ravenBusy, setRavenBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["artisan", handle],
    queryFn: () => api<ArtisanProfile>(`/artisans/${handle}`),
  });

  const startRaven = useMutation({
    mutationFn: () =>
      api<Conversation>("/conversations", {
        method: "POST",
        body: { userId: data?.artisan.id, subject: `A raven to ${data?.artisan.name}` },
      }),
    onSuccess: (conversation) => {
      toast("The raven is away. Continue the thread.", "success");
      navigate(`/messages?c=${conversation.id}`);
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  if (isLoading || !data) {
    return (
      <div className="container-hall">
        <LoadingHall label="Opening the chronicle" />
      </div>
    );
  }

  const artisan = data.artisan;
  const isSelf = user?.id === artisan.id;

  return (
    <div>
      <div className="relative overflow-hidden border-b border-gold/12 pb-9 pt-28 sm:pt-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(800px 320px at 25% 0%, ${artisan.avatarColor}22, transparent 70%), radial-gradient(700px 280px at 90% 20%, rgba(140,28,28,0.1), transparent 70%)`,
          }}
        />
        <div className="container-hall relative">
          <Link to="/artisans" className="mb-6 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-parchment/35 transition hover:text-gold">
            <ArrowLeft size={12} /> The directory
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <SigilAvatar name={artisan.name} color={artisan.avatarColor} size={96} verified={artisan.verified} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl text-parchment sm:text-4xl">{artisan.name}</h1>
                  {artisan.verified && (
                    <span className="badge badge-gold">
                      <BadgeCheck size={10} /> Seal verified
                    </span>
                  )}
                </div>
                <p className="mt-1.5 font-serif text-lg text-gold-2/90">{artisan.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-parchment/40">
                  <span className="inline-flex items-center gap-1.5">
                    <StarRating rating={artisan.rating} count={artisan.reviewsCount} showValue />
                  </span>
                  <RegionBadge region={artisan.region} />
                  <span className="inline-flex items-center gap-1"><MapPin size={10} /> {artisan.location}</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays size={10} /> Joined {dateLabel(artisan.joinedAt)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-parchment/10 border-y border-parchment/10 py-3 lg:border-y-0">
              <div className="pr-4 text-center">
                <p className="font-display text-xl text-parchment">{artisan.completedContracts}</p>
                <p className="text-[8px] uppercase tracking-[0.16em] text-parchment/30">Oaths kept</p>
              </div>
              <div className="px-4 text-center">
                <p className="font-display text-xl text-parchment">{data.proposalsSent}</p>
                <p className="text-[8px] uppercase tracking-[0.16em] text-parchment/30">Proposals</p>
              </div>
              <div className="pl-4 text-center">
                <p className="font-display text-xl text-gold-2">{money(artisan.hourlyRate)}</p>
                <p className="text-[8px] uppercase tracking-[0.16em] text-parchment/30">Per hour</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-hall grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="panel p-6 sm:p-8">
            <p className="eyebrow">The chronicle</p>
            <p className="prose-lore mt-4">{data.bio}</p>
            <div className="mt-6 border-t border-gold/12 pt-5">
              <p className="field-label">Crafts and tools</p>
              <div className="flex flex-wrap gap-1.5">
                {artisan.skills.map((skill) => <span key={skill} className="tag">{skill}</span>)}
              </div>
            </div>
          </section>

          <section className="panel p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Chronicles written</p>
                <h2 className="mt-2 font-display text-lg text-parchment">
                  What patrons say after the seal breaks
                </h2>
              </div>
              <span className="font-display text-2xl text-gold-2">{artisan.rating.toFixed(1)}</span>
            </div>

            <div className="mt-6 space-y-5">
              {data.reviews.length === 0 && (
                <p className="border border-parchment/10 px-4 py-8 text-center text-sm text-parchment/35">
                  No chronicles yet. Be the first to swear an oath with this artisan.
                </p>
              )}
              {data.reviews.map((review) => (
                <article key={review.id} className="border-b border-parchment/8 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <SigilAvatar name={review.patron.name} color={review.patron.avatarColor} size={32} ring={false} />
                      <div>
                        <p className="text-[12px] text-parchment/80">{review.patron.name}</p>
                        <p className="text-[9px] uppercase tracking-[0.12em] text-parchment/25">
                          {review.contractReference} · {dateLabel(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-gold">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-3 font-serif text-[15px] leading-relaxed text-parchment/60">
                    "{review.comment}"
                  </p>
                </article>
              ))}
            </div>
          </section>

          {data.activeJobs.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="eyebrow">Open in their hall</p>
                  <h2 className="mt-1 font-display text-lg text-parchment">Decrees near this craft</h2>
                </div>
                <Link to="/jobs" className="btn btn-quiet">All decrees <ArrowRight size={11} /></Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.activeJobs.map((job) => <JobCard key={job.id} job={job} compact />)}
              </div>
            </section>
          )}
        </div>

        <aside>
          <div className="panel sticky top-24 p-5">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Commission</p>
              <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-moss">
                <span className="h-1.5 w-1.5 rounded-full bg-moss" /> Available
              </span>
            </div>
            <p className="mt-3 font-display text-2xl text-gold-2">{money(artisan.hourlyRate)} <span className="text-xs text-parchment/30">/ hour</span></p>
            <p className="mt-1 text-[11px] leading-relaxed text-parchment/40">
              Final sums are agreed in the contract. The vault holds the full amount until delivery.
            </p>

            <div className="mt-5 space-y-2">
              {isSelf ? (
                <>
                  <Link to="/dashboard" className="btn btn-gold w-full">Your hall</Link>
                  <Link to="/settings" className="btn btn-ghost w-full">Amend your chronicle</Link>
                </>
              ) : user ? (
                <>
                  <button
                    onClick={() => startRaven.mutate()}
                    disabled={startRaven.isPending}
                    className="btn btn-gold w-full"
                  >
                    <MessageSquare size={13} /> {startRaven.isPending ? "Sending..." : "Send a raven"}
                  </button>
                  <Link to="/post" className="btn btn-ghost w-full">
                    Post a decree <ArrowRight size={12} />
                  </Link>
                </>
              ) : (
                <>
                  <Link to={`/login?next=/artisans/${artisan.handle}`} className="btn btn-gold w-full">
                    Sign in to send a raven
                  </Link>
                  <Link to="/join" className="btn btn-ghost w-full">Join the guild</Link>
                </>
              )}
            </div>

            <div className="mt-5 space-y-3 border-t border-parchment/8 pt-4 text-[10px] text-parchment/35">
              <p className="flex items-center gap-2"><ScrollText size={11} className="text-gold/50" /> {artisan.completedContracts} contracts fulfilled</p>
              <p className="flex items-center gap-2"><Coins size={11} className="text-gold/50" /> Escrow released only on approval</p>
              <p className="flex items-center gap-2"><Sparkles size={11} className="text-gold/50" /> Oracle available in every thread</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
