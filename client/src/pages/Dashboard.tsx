import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Coins,
  FileText,
  Handshake,
  MessagesSquare,
  Plus,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Vault,
} from "lucide-react";
import { api, dateLabel, money, shortDate, timeAgo } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Dashboard } from "../lib/types";
import { JobCard } from "../components/JobCard";
import { StatusBadge } from "../components/StatusBadge";
import { SigilAvatar } from "../components/SigilAvatar";
import { LoadingHall } from "../components/EmptyState";

const NOTIFICATION_TONE: Record<string, string> = {
  PROPOSAL: "text-gold",
  CONTRACT: "text-gold",
  PAYMENT: "text-moss",
  MESSAGE: "text-parchment/70",
  REVIEW: "text-gold-2",
  SYSTEM: "text-parchment/50",
};

export function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<Dashboard>("/dashboard"),
  });

  if (isLoading || !data || !user) {
    return (
      <div className="container-hall">
        <LoadingHall label="Opening your hall" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morrow" : hour < 18 ? "Well met" : "Good evening";
  const firstName = data.user.name.split(" ")[0];
  const isArtisan = data.user.role === "ARTISAN";

  const stats = [
    {
      label: "Oaths in motion",
      value: String(data.activeContracts),
      note: "contracts not yet sealed",
      icon: Handshake,
    },
    {
      label: isArtisan ? "Proposals afield" : "Oaths received",
      value: String(data.openProposals),
      note: isArtisan ? "awaiting a patron answer" : "awaiting your judgment",
      icon: FileText,
    },
    {
      label: "Coin in the vault",
      value: money(data.vaultHeld),
      note: "held until delivery",
      icon: Vault,
    },
    {
      label: "Your purse",
      value: money(data.walletBalance),
      note: "ready to withdraw",
      icon: Coins,
    },
  ];

  const live = data.contracts.filter((contract) => contract.status !== "RELEASED" && contract.status !== "CANCELLED");
  const closed = data.contracts.filter((contract) => contract.status === "RELEASED");

  return (
    <div>
      <header className="relative overflow-hidden border-b border-gold/12 pb-8 pt-28 sm:pt-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(760px 280px at 15% 0%, rgba(201,162,39,0.1), transparent 70%), radial-gradient(680px 260px at 92% 10%, rgba(140,28,28,0.1), transparent 70%)",
          }}
        />
        <div className="container-hall relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">{greeting}, {firstName}</p>
              <h1 className="display-section mt-2 text-parchment">Your hall stands open.</h1>
              <p className="serif-lede mt-3 max-w-xl">
                {live.length > 0
                  ? `${live.length} ${live.length === 1 ? "oath is" : "oaths are"} still in motion. The ledger has kept every one.`
                  : "The ledger is quiet for now. A well written decree or a sharp proposal will stir it again."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={isArtisan ? "/jobs" : "/post"} className="btn btn-gold">
                {isArtisan ? <ScrollText size={13} /> : <Plus size={13} />}
                {isArtisan ? "Find a decree" : "Post a decree"}
              </Link>
              <Link to="/messages" className="btn btn-ghost">
                <MessagesSquare size={13} /> Ravens
              </Link>
              <Link to="/treasury" className="btn btn-quiet">
                <Coins size={13} /> Treasury
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="panel-soft flex items-start justify-between gap-3 p-4"
              >
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-parchment/35">{stat.label}</p>
                  <p className="mt-2 font-display text-[1.35rem] leading-none text-parchment">{stat.value}</p>
                  <p className="mt-1.5 text-[10px] text-parchment/30">{stat.note}</p>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center border border-gold/20 text-gold/65">
                  <stat.icon size={14} />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      <div className="container-hall grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Oaths in motion</p>
                <h2 className="mt-1 font-display text-xl text-parchment">Contracts still being kept</h2>
              </div>
              <Link to="/contracts" className="btn btn-quiet shrink-0">
                All contracts <ArrowRight size={11} />
              </Link>
            </div>

            {live.length === 0 ? (
              <div className="panel-soft flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-base text-parchment/85">No open oaths just yet.</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-parchment/40">
                    {isArtisan
                      ? "Answer a decree that fits your craft and the hall will do the rest."
                      : "Post a decree, accept a proposal, and seal the vault to begin."}
                  </p>
                </div>
                <Link to={isArtisan ? "/jobs" : "/post"} className="btn btn-gold shrink-0">
                  {isArtisan ? "Browse decrees" : "Post a decree"}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {live.slice(0, 5).map((contract) => {
                  const other = contract.patronSide ? contract.artisan : contract.patron;
                  return (
                    <Link
                      key={contract.id}
                      to={`/contracts/${contract.id}`}
                      className="panel panel-hover block p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <SigilAvatar name={other.name} color={other.avatarColor} size={38} ring={false} />
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.16em] text-parchment/30">
                              {contract.reference} · {contract.patronSide ? "Artisan" : "Patron"}
                            </p>
                            <p className="mt-0.5 font-display text-[14px] leading-snug text-parchment">
                              {contract.jobTitle}
                            </p>
                            <p className="mt-0.5 text-[10.5px] text-parchment/35">
                              with {other.name}
                              {contract.dueAt ? ` · due ${shortDate(contract.dueAt)}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <StatusBadge status={contract.status} />
                          <p className="font-display text-[15px] text-gold-2">{money(contract.total)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-parchment/8 pt-3 text-[10px] text-parchment/30">
                        <span className="inline-flex items-center gap-1.5">
                          <ShieldCheck size={11} className="text-gold/50" />
                          {contract.gateway === "PAYPAL"
                            ? "PayPal escrow"
                            : contract.gateway === "CROWN"
                              ? "Crown ledger escrow"
                              : "Vault not yet sealed"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-gold/70">
                          Open the room <ArrowUpRight size={11} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {closed.length > 0 && (
            <section>
              <p className="eyebrow">Chronicle</p>
              <h2 className="mt-1 font-display text-xl text-parchment">Oaths fulfilled</h2>
              <div className="mt-4 panel overflow-hidden">
                <table className="table-lore">
                  <thead>
                    <tr>
                      <th>Contract</th>
                      <th>Counterpart</th>
                      <th className="hidden sm:table-cell">Sealed</th>
                      <th className="text-right">Sum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closed.slice(0, 6).map((contract) => {
                      const other = contract.patronSide ? contract.artisan : contract.patron;
                      return (
                        <tr key={contract.id}>
                          <td>
                            <Link to={`/contracts/${contract.id}`} className="link-gold">
                              {contract.jobTitle}
                            </Link>
                            <span className="mt-0.5 block text-[9px] uppercase tracking-[0.12em] text-parchment/25">
                              {contract.reference}
                            </span>
                          </td>
                          <td className="text-parchment/60">{other.name}</td>
                          <td className="hidden text-[10px] text-parchment/35 sm:table-cell">
                            {dateLabel(contract.releasedAt)}
                          </td>
                          <td className="text-right font-display text-gold-2">{money(contract.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Chosen for your craft</p>
                <h2 className="mt-1 font-display text-xl text-parchment">Decrees worth answering</h2>
              </div>
              <Link to="/jobs" className="btn btn-quiet shrink-0">
                The board <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.recommendedJobs.slice(0, 4).map((job) => (
                <JobCard key={job.id} job={job} compact />
              ))}
              {data.recommendedJobs.length === 0 && (
                <p className="panel-soft p-6 text-[12px] text-parchment/40 sm:col-span-2">
                  No decrees are open in your region yet. The board turns over quickly.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Ravens</p>
                <h2 className="mt-1 font-display text-base text-parchment">Arrived at your window</h2>
              </div>
              <Bell size={15} className="text-gold/50" />
            </div>

            <div className="mt-4 space-y-3">
              {data.notifications.length === 0 && (
                <p className="text-[12px] leading-relaxed text-parchment/35">
                  No ravens yet. The hall will send word when something moves.
                </p>
              )}
              {data.notifications.slice(0, 6).map((note) => (
                <Link
                  key={note.id}
                  to={note.link ?? "/dashboard"}
                  className="block border-b border-parchment/8 pb-3 last:border-0 last:pb-0"
                >
                  <p className={`text-[11.5px] font-medium ${NOTIFICATION_TONE[note.type] ?? "text-parchment/70"}`}>
                    {note.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-parchment/38">
                    {note.body}
                  </p>
                  <p className="mt-1 text-[8.5px] uppercase tracking-[0.14em] text-parchment/22">
                    {timeAgo(note.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel relative overflow-hidden p-5">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(320px 180px at 80% 0%, rgba(201,162,39,0.14), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-gold/70">
                <Sparkles size={14} />
                <p className="eyebrow !text-gold/70">The Oracle</p>
              </div>
              <p className="mt-3 font-display text-[15px] leading-snug text-parchment">
                {isArtisan ? "Sharpen your next proposal." : "Write a decree that attracts real craft."}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-parchment/40">
                {isArtisan
                  ? "Ask for a price, a scope, or an opening that sounds like you. The Oracle keeps it practical."
                  : "Describe the outcome and the Oracle will shape a brief with clear edges and a fair purse."}
              </p>
              <Link to="/counsel" className="btn btn-ghost mt-4 w-full">
                Consult the Oracle <ArrowRight size={11} />
              </Link>
            </div>
          </section>

          <section className="panel p-5">
            <p className="eyebrow">Quick roads</p>
            <div className="mt-3 space-y-1.5">
              {[
                { to: "/jobs", label: "The decree board", icon: ScrollText },
                { to: "/artisans", label: "The artisan directory", icon: Handshake },
                { to: "/contracts", label: "All contracts", icon: FileText },
                { to: "/treasury", label: "The treasury", icon: Coins },
                { to: "/settings", label: "Amend your seal", icon: ShieldCheck },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex items-center justify-between border-b border-parchment/6 py-2.5 text-[11.5px] text-parchment/55 transition hover:text-parchment"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <item.icon size={12} className="text-gold/50" />
                    {item.label}
                  </span>
                  <ArrowUpRight size={11} className="text-parchment/20 transition group-hover:text-gold" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
