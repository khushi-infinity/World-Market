import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Coins,
  Lock,
  ScrollText,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { api, dateLabel, gold, money, timeAgo } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import type { AiResponse, Contract, Job, Proposal } from "../lib/types";
import { regionByName } from "../lib/regions";
import { PageHeader } from "../components/PageHeader";
import { RegionBadge } from "../components/RegionBadge";
import { StatusBadge } from "../components/StatusBadge";
import { SigilAvatar } from "../components/SigilAvatar";
import { StarRating } from "../components/StarRating";
import { LoadingHall } from "../components/EmptyState";

export function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [bid, setBid] = useState("");
  const [days, setDays] = useState("14");
  const [letter, setLetter] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => api<Job>(`/jobs/${id}`),
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ["job-proposals", id],
    queryFn: () => api<Proposal[]>(`/jobs/${id}/proposals`),
    enabled: Boolean(user) && Boolean(job),
  });

  const submit = useMutation({
    mutationFn: () =>
      api<Proposal>(`/jobs/${id}/proposals`, {
        method: "POST",
        body: { coverLetter: letter, bidAmount: Number(bid), days: Number(days), aiDrafted: false },
      }),
    onSuccess: () => {
      toast("Your proposal is before the patron.", "success");
      setLetter("");
      setBid("");
      void queryClient.invalidateQueries({ queryKey: ["job", id] });
      void queryClient.invalidateQueries({ queryKey: ["job-proposals", id] });
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  const accept = useMutation({
    mutationFn: (proposalId: number) =>
      api<Contract>(`/proposals/${proposalId}/accept`, { method: "POST" }),
    onSuccess: (contract) => {
      toast("The oath is sworn. Seal the vault to begin.", "success");
      navigate(`/contracts/${contract.id}`);
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  const draftWithOracle = async () => {
    if (!job) return;
    setAiBusy(true);
    try {
      const result = await api<AiResponse>("/ai/proposal", {
        method: "POST",
        body: {
          jobId: job.id,
          tone: "measured, specific, and confident",
          highlights: user ? `Skills: ${user.skills.join(", ")}. ${user.completedContracts} delivered contracts.` : "",
        },
      });
      setLetter(result.text);
      if (!bid) setBid(String(job.budgetMin));
      toast(result.live ? "The Oracle has drafted your proposal." : "Local counsel drafted your proposal.", "success");
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setAiBusy(false);
    }
  };

  if (isLoading || !job) {
    return (
      <div className="container-hall">
        <LoadingHall label="Reading the decree" />
      </div>
    );
  }

  const region = regionByName(job.region);
  const myProposal = proposals.find((p) => p.artisan.id === user?.id);
  const owner = job.mine;
  const canPropose = user?.role === "ARTISAN" && !owner && job.status === "OPEN" && !myProposal;

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Link to="/jobs" className="inline-flex items-center gap-1 text-parchment/40 transition hover:text-gold">
              <ArrowLeft size={12} /> All decrees
            </Link>
            <span className="text-parchment/20">/</span>
            {job.region}
          </span>
        }
        title={job.title}
        lede={undefined}
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={job.status} />
          {job.featured && <span className="badge badge-gold">Chosen decree</span>}
          <RegionBadge region={job.region} />
          <span className="text-[10px] text-parchment/30">Posted {timeAgo(job.createdAt)}</span>
          <span className="text-[10px] text-parchment/30">
            <Users size={10} className="mr-1 inline" /> {job.proposalsCount} proposals
          </span>
        </div>
      </PageHeader>

      <div className="container-hall grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <article className="panel p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow">The decree</p>
              <span className="text-[10px] text-parchment/30">
                <CalendarDays size={11} className="mr-1 inline" />
                Due {dateLabel(job.deadline)}
              </span>
            </div>
            <p className="prose-lore mt-5">{job.description}</p>

            <div className="mt-7 border-t border-gold/12 pt-5">
              <p className="field-label">Craft sought</p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="panel-soft p-3">
                <p className="text-[9px] uppercase tracking-[0.16em] text-parchment/30">Purse</p>
                <p className="mt-1 font-display text-sm text-gold-2">
                  {gold(job.budgetMin)} to {gold(job.budgetMax)}
                </p>
                <p className="text-[9px] text-parchment/30">
                  {job.budgetType === "HOURLY" ? "per hour" : "fixed sum"}
                </p>
              </div>
              <div className="panel-soft p-3">
                <p className="text-[9px] uppercase tracking-[0.16em] text-parchment/30">Duration</p>
                <p className="mt-1 font-display text-sm text-parchment/85">{job.duration}</p>
                <p className="text-[9px] text-parchment/30">from the seal</p>
              </div>
              <div className="panel-soft p-3">
                <p className="text-[9px] uppercase tracking-[0.16em] text-parchment/30">Hall</p>
                <p className="mt-1 flex items-center gap-1.5 font-display text-sm text-parchment/85">
                  <region.icon size={13} style={{ color: region.accent }} />
                  {region.short}
                </p>
                <p className="text-[9px] text-parchment/30">{region.tagline}</p>
              </div>
            </div>
          </article>

          <section className="panel p-6 sm:p-8">
            <p className="eyebrow">The patron</p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <SigilAvatar name={job.patron.name} color={job.patron.avatarColor} size={52} verified={job.patron.verified} />
                <div>
                  <p className="font-display text-[15px] text-parchment">{job.patron.name}</p>
                  <p className="text-[11px] text-parchment/40">{job.patron.title}</p>
                  <p className="mt-1 text-[10px] text-parchment/30">
                    Member since {dateLabel(job.patron.joinedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-parchment/35">
                <span className="inline-flex items-center gap-1">
                  <ScrollText size={11} /> {job.patron.completedContracts} contracts
                </span>
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck size={11} className="text-gold/60" /> Verified
                </span>
              </div>
            </div>
          </section>

          <section className="vault p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">How the coin moves</p>
                <h2 className="mt-2 font-display text-xl text-parchment">The vault holds the full purse.</h2>
                <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-parchment/45">
                  On acceptance, a contract is drawn and the patron seals the full sum plus the 10% guild tithe
                  in escrow. The artisan is paid only after delivery and approval. A dispute freezes the vault.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 border border-gold/20 bg-black/20 px-4 py-3">
                <ShieldCheck size={20} className="text-gold/70" />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-parchment/35">Escrow by</p>
                  <p className="font-display text-sm text-parchment/85">PayPal</p>
                </div>
              </div>
            </div>
          </section>

          {owner && (
            <section className="panel p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Proposals received</p>
                  <h2 className="mt-2 font-display text-lg text-parchment">
                    {proposals.length} {proposals.length === 1 ? "artisan has" : "artisans have"} answered
                  </h2>
                </div>
                <Link to="/dashboard" className="btn btn-quiet">The hall <ArrowRight size={12} /></Link>
              </div>

              <div className="mt-5 space-y-3">
                {proposals.length === 0 && (
                  <p className="border border-parchment/10 px-4 py-8 text-center text-sm text-parchment/35">
                    No proposals yet. The decree is still open.
                  </p>
                )}
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="panel-soft p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <Link to={`/artisans/${proposal.artisan.handle}`} className="flex items-center gap-3">
                        <SigilAvatar name={proposal.artisan.name} color={proposal.artisan.avatarColor} size={40} />
                        <div>
                          <p className="text-[13px] text-parchment/85">{proposal.artisan.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-parchment/35">
                            <StarRating rating={proposal.artisan.rating} size={10} showValue />
                            <span>{proposal.artisan.completedContracts} contracts</span>
                          </div>
                        </div>
                      </Link>
                      <div className="text-right">
                        <p className="font-display text-sm text-gold-2">{money(proposal.bidAmount)}</p>
                        <p className="text-[10px] text-parchment/35">{proposal.days} days</p>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-[12px] leading-relaxed text-parchment/55">
                      {proposal.coverLetter}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-parchment/8 pt-3">
                      <span className="text-[9px] uppercase tracking-[0.14em] text-parchment/25">
                        {proposal.status === "PENDING" ? `Sworn ${timeAgo(proposal.createdAt)}` : proposal.status}
                        {proposal.aiDrafted && " · drafted with counsel"}
                      </span>
                      {proposal.status === "PENDING" && job.status === "OPEN" && (
                        <button
                          onClick={() => accept.mutate(proposal.id)}
                          disabled={accept.isPending}
                          className="btn btn-gold !px-3 !py-1.5 !text-[9px]"
                        >
                          {accept.isPending ? "Swearing..." : "Accept and swear"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel sticky top-24 overflow-hidden">
            <div className="border-b border-gold/15 bg-gold/[0.04] p-5">
              <p className="eyebrow">The purse</p>
              <p className="mt-2 font-display text-2xl text-gold-2">
                {money(job.budgetMin)} <span className="text-sm text-parchment/30">to</span> {money(job.budgetMax)}
              </p>
              <p className="mt-1 text-[10px] text-parchment/35">
                {job.budgetType === "HOURLY" ? "Hourly rate, estimate only" : "Fixed sum for the full scope"}
              </p>
            </div>

            <div className="p-5">
              {!user && (
                <div className="space-y-3">
                  <p className="text-[12px] leading-relaxed text-parchment/50">
                    Sign in as an artisan to swear a proposal, or as a patron to manage your decrees.
                  </p>
                  <Link to={`/login?next=/jobs/${job.id}`} className="btn btn-gold w-full">
                    Sign in to propose
                  </Link>
                  <Link to="/join" className="btn btn-ghost w-full">Join the guild</Link>
                </div>
              )}

              {user && user.role !== "ARTISAN" && !owner && (
                <div className="space-y-3">
                  <p className="text-[12px] leading-relaxed text-parchment/50">
                    You hold a patron seal. Only artisans may swear a proposal, but you can post your own decree.
                  </p>
                  <Link to="/post" className="btn btn-ghost w-full">Post a decree</Link>
                </div>
              )}

              {owner && (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-[12px] text-gold-2">
                    <ScrollText size={13} /> This decree is yours.
                  </p>
                  <p className="text-[11px] leading-relaxed text-parchment/40">
                    Proposals appear in the panel to the left. Accepting one draws the contract and opens the vault.
                  </p>
                  <Link to="/dashboard" className="btn btn-ghost w-full">Return to the hall</Link>
                </div>
              )}

              {myProposal && (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-[12px] text-gold-2">
                    <Send size={13} /> Your proposal is before the patron.
                  </p>
                  <p className="text-[11px] leading-relaxed text-parchment/40">
                    Bid {money(myProposal.bidAmount)} over {myProposal.days} days. Status: {myProposal.status.toLowerCase()}.
                  </p>
                </div>
              )}

              {canPropose && (
                  <form
                  onSubmit={(event: FormEvent) => {
                    event.preventDefault();
                    submit.mutate();
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="field-label" htmlFor="bid">Your bid</label>
                      <input
                        id="bid"
                        value={bid}
                        onChange={(event) => setBid(event.target.value.replace(/[^0-9.]/g, ""))}
                        placeholder={String(job.budgetMin)}
                        className="input !py-2 !text-[12px]"
                        required
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="days">Days</label>
                      <input
                        id="days"
                        value={days}
                        onChange={(event) => setDays(event.target.value.replace(/[^0-9]/g, ""))}
                        className="input !py-2 !text-[12px]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="field-label" htmlFor="letter">Your oath</label>
                      <button
                        type="button"
                        onClick={draftWithOracle}
                        disabled={aiBusy}
                        className="mb-1.5 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-gold/70 transition hover:text-gold"
                      >
                        <Sparkles size={10} /> {aiBusy ? "Drafting..." : "Draft with the Oracle"}
                      </button>
                    </div>
                    <textarea
                      id="letter"
                      value={letter}
                      onChange={(event) => setLetter(event.target.value)}
                      placeholder="Why you, what you will deliver, and when."
                      className="textarea !min-h-[150px] !text-[12px]"
                      required
                      minLength={40}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submit.isPending}
                    className="btn btn-gold w-full"
                  >
                    {submit.isPending ? "Swearing..." : "Swear this proposal"} <ArrowRight size={13} />
                  </button>
                  <p className="flex items-start gap-1.5 text-[9px] leading-relaxed text-parchment/25">
                    <Lock size={10} className="mt-0.5 shrink-0" />
                    No coin moves until the patron accepts and seals the vault.
                  </p>
                </form>
              )}

              {job.status !== "OPEN" && !owner && !myProposal && (
                <p className="text-[12px] text-parchment/40">
                  This decree is no longer open for proposals.
                </p>
              )}
            </div>

            <div className="border-t border-parchment/8 px-5 py-4 text-[9px] uppercase tracking-[0.14em] text-parchment/25">
              <span className="inline-flex items-center gap-1.5"><Coins size={11} className="text-gold/50" /> Sandbox coin only</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
