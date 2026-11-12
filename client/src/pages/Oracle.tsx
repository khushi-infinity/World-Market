import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Coins, Gavel, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import type { PublicConfig } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { OracleChat } from "../components/OracleChat";

const ABILITIES = [
  {
    icon: ScrollText,
    title: "Shape a decree",
    body: "Turn a vague need into a brief with clear edges, a fair purse, and a date that holds.",
  },
  {
    icon: Coins,
    title: "Price the work",
    body: "Sanity check a bid, a rate, or a scope before you swear to it in writing.",
  },
  {
    icon: Gavel,
    title: "Cool a dispute",
    body: "Lay out the promise, the gap, and the remedy in words a warden can act on.",
  },
  {
    icon: ShieldCheck,
    title: "Guard the oath",
    body: "Find the missing acceptance criteria before the vault is sealed, not after.",
  },
];

export function Oracle() {
  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: () => api<PublicConfig>("/config"),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div>
      <PageHeader
        eyebrow="The Oracle of Emberhall"
        title="Counsel for the work before the oath."
        lede="The Oracle has read every decree in the hall. Ask about scope, price, delivery, or a dispute that needs a cool head. It keeps its counsel practical."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge badge-gold">
            <Sparkles size={10} />
            {config?.aiConfigured ? `Live · ${config.aiModel}` : "Local counsel"}
          </span>
          <span className="text-[10px] text-parchment/30">Not legal advice. Not a warden ruling.</span>
        </div>
      </PageHeader>

      <div className="container-hall grid gap-8 py-9 lg:grid-cols-[1fr_340px]">
        <section className="panel flex min-h-[480px] flex-col p-5 sm:p-7">
          <div className="mb-4 flex items-center gap-3 border-b border-gold/12 pb-4">
            <span className="oracle-orb !h-10 !w-10">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="font-display text-sm tracking-[0.14em] text-parchment">THE ORACLE</p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-parchment/32">
                {config?.aiConfigured ? "Reading the embers live" : "Local counsel, no key required"}
              </p>
            </div>
          </div>
          <OracleChat variant="page" />
        </section>

        <aside className="space-y-5">
          <section className="panel p-5">
            <p className="eyebrow">What it is good for</p>
            <div className="mt-4 space-y-4">
              {ABILITIES.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-gold/18 text-gold/60">
                    <item.icon size={13} />
                  </span>
                  <div>
                    <p className="text-[11.5px] font-medium text-parchment/75">{item.title}</p>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-parchment/35">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex items-center gap-2 text-gold/70">
              <BookOpen size={14} />
              <p className="eyebrow !text-gold/70">How to ask</p>
            </div>
            <ul className="mt-3 space-y-2.5 text-[10.5px] leading-relaxed text-parchment/40">
              <li>Name the outcome and the constraint, not only the tool.</li>
              <li>Give the purse and the date if you have them.</li>
              <li>Paste the sticking point into the context field.</li>
              <li>Ask for one clear next step, not a speech.</li>
            </ul>
            <Link to="/jobs" className="btn btn-quiet mt-4 w-full">
              Take the counsel to the board <ArrowRight size={11} />
            </Link>
          </section>

          <section className="panel p-5">
            <p className="eyebrow">The limit</p>
            <p className="mt-2 text-[10.5px] leading-relaxed text-parchment/38">
              The Oracle advises, but it does not sign, fund, release, or rule. Those acts belong to patrons,
              artisans, and wardens. Read every draft before you swear to it.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
