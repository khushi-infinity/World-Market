import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Feather,
  Lock,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
} from "lucide-react";
import { api, money } from "../lib/api";
import type { Job, PageResponse, Stats, UserSummary } from "../lib/types";
import { REGIONS } from "../lib/regions";
import { CitadelScene } from "../components/art/CitadelScene";
import { RealmMap } from "../components/art/RealmMap";
import { ArtisanCard } from "../components/ArtisanCard";
import { JobCard } from "../components/JobCard";
import { SectionHeading } from "../components/SectionHeading";
import { Sigil } from "../components/Logo";
import { StarRating } from "../components/StarRating";

const CHRONICLES = [
  {
    quote:
      "The vault changed how we hire. The coin is already sealed when work begins, so the conversation is about craft, not trust.",
    name: "Lord Bastian Rook",
    title: "Master of the Rookery",
    color: "#2f4f6b",
  },
  {
    quote:
      "I have never had a client see the escrow ledger before. It made the whole contract feel like a shared oath instead of a gamble.",
    name: "Aelira Voss",
    title: "Forgemaster of Systems",
    color: "#c9a227",
  },
  {
    quote:
      "The Oracle caught a scope gap before we sealed the vault. That single answer saved a week of argument.",
    name: "Lady Seraphine Wynn",
    title: "Keeper of the Wynn Purse",
    color: "#2f6b6b",
  },
];

export function Landing() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: () => api<Stats>("/public/stats"),
  });

  const { data: featured } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: () => api<Job[]>("/public/featured-jobs"),
  });

  const { data: artisans } = useQuery({
    queryKey: ["top-artisans"],
    queryFn: () => api<PageResponse<UserSummary>>("/artisans?sort=rating&size=4"),
  });

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/jobs?q=${encodeURIComponent(query.trim())}` : "/jobs");
  };

  return (
    <div>
      <section className="hero">
        <div className="hero-art">
          <CitadelScene />
        </div>
        <div className="hero-fade" />

        <div className="container-hall relative z-10 pb-16 pt-32 sm:pt-36">
          <div className="max-w-[720px]">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="eyebrow mb-5 flex items-center gap-2">
                <span className="h-px w-8 bg-gold/60" />
                The guild market of the seven realms
              </p>
              <h1 className="display-hero text-parchment">
                Where oaths are sworn,
                <br />
                <span className="text-gold-2">and craft is paid in gold.</span>
              </h1>
              <p className="serif-lede mt-6 max-w-xl">
                A marketplace for independent artisans. Post a decree, swear an oath, and seal the coin in
                escrow. The vault opens only when the work is delivered.
              </p>
            </motion.div>

            <motion.form
              onSubmit={search}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 max-w-xl"
            >
              <div className="search-shell">
                <Search size={17} className="shrink-0 text-gold/60" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Seek a craft or a master..."
                  aria-label="Search the hall"
                />
                <button type="submit" className="btn btn-gold !px-4 !py-2.5 !text-[10px]">
                  Search
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-parchment/35">
                <span className="uppercase tracking-[0.16em] text-parchment/25">Often sought</span>
                {["React", "Brand identity", "Spring AI", "Lore", "PayPal"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => navigate(`/jobs?q=${encodeURIComponent(term)}`)}
                    className="transition hover:text-gold-2"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link to="/post" className="btn btn-gold">
                Post a decree <ArrowRight size={14} />
              </Link>
              <Link to="/jobs" className="btn btn-ghost">
                Walk the hall
              </Link>
              <span className="ml-1 hidden items-center gap-2 text-[10px] text-parchment/35 sm:flex">
                <Lock size={11} className="text-gold/60" />
                Coin held by PayPal escrow
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.45 }}
              className="mt-12 grid max-w-xl grid-cols-3 divide-x divide-parchment/10 border-y border-parchment/10 py-4"
            >
              <div className="pr-4">
                <p className="stat-number">{stats?.artisans ?? 12}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-parchment/35">Sworn artisans</p>
              </div>
              <div className="px-4">
                <p className="stat-number">{money(stats?.goldInVault ?? 0)}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-parchment/35">Held in escrow</p>
              </div>
              <div className="pl-4">
                <p className="stat-number">{stats?.contractsSealed ?? 0}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-parchment/35">Oaths fulfilled</p>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="absolute bottom-8 right-6 z-10 hidden w-[280px] border border-gold/25 bg-[#0c0a08]/85 p-4 backdrop-blur-md lg:block"
        >
          <div className="flex items-center justify-between">
            <span className="eyebrow !text-[8px]">The vault, this moon</span>
            <span className="flex items-center gap-1 text-[8px] uppercase tracking-[0.16em] text-moss">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" /> sealed
            </span>
          </div>
          <p className="mt-2 font-display text-2xl text-gold-2">{money(5720)}</p>
          <p className="mt-1 text-[10px] text-parchment/40">Held for a delivered trading hall</p>
          <div className="mt-3 h-px bg-gold/15" />
          <div className="mt-3 flex items-center justify-between text-[9px] text-parchment/35">
            <span>Patron: Aeryn Cael</span>
            <span className="text-gold/70">EH-2026-0101</span>
          </div>
        </motion.div>
      </section>

      <div className="border-y border-gold/12 bg-[#0a0907]">
        <div className="container-hall flex flex-wrap items-center justify-between gap-4 py-4 text-[9px] uppercase tracking-[0.2em] text-parchment/30">
          <span className="inline-flex items-center gap-2"><ShieldCheck size={13} className="text-gold/60" /> Escrow by PayPal</span>
          <span className="inline-flex items-center gap-2"><Sparkles size={13} className="text-gold/60" /> Counsel by Spring AI</span>
          <span className="inline-flex items-center gap-2"><MessageSquare size={13} className="text-gold/60" /> Ravens in real time</span>
          <span className="inline-flex items-center gap-2"><BadgeCheck size={13} className="text-gold/60" /> Oaths in writing</span>
          <span className="hidden items-center gap-2 md:inline-flex"><Coins size={13} className="text-gold/60" /> Sandbox coin only</span>
        </div>
      </div>

      <section className="relative py-20 sm:py-24">
        <div className="container-hall">
          <SectionHeading
            eyebrow="The realm"
            title="Six halls. One standard of craft."
            lede="Every decree belongs to a region. Walk the map or step directly into the hall that matches the work."
            action={
              <Link to="/artisans" className="btn btn-ghost">
                Enter the directory <ArrowRight size={13} />
              </Link>
            }
          />

          <div className="map-panel mt-10 hidden h-[460px] md:block">
            <div className="map-art">
              <RealmMap />
            </div>
            {REGIONS.map((region, index) => (
              <Link
                key={region.name}
                to={`/jobs?region=${encodeURIComponent(region.name)}`}
                className="region-pin group"
                style={{ left: `${region.x}%`, top: `${region.y}%` }}
              >
                <span className="pin-dot" style={{ color: region.accent }}>
                  <region.icon size={11} />
                </span>
                <span>
                  <span className="block font-display text-[10px] tracking-[0.12em] text-parchment/85">
                    {region.name}
                  </span>
                  <span className="block text-[8px] uppercase tracking-[0.14em] text-parchment/30">
                    0{index + 1}
                  </span>
                </span>
              </Link>
            ))}
            <div className="absolute bottom-4 left-5 z-[2] flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-parchment/25">
              <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
              The known realms
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((region) => (
              <Link
                key={region.name}
                to={`/jobs?region=${encodeURIComponent(region.name)}`}
                className="panel panel-hover group flex items-start gap-3.5 p-4"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center border"
                  style={{ borderColor: `${region.accent}66`, color: region.accent }}
                >
                  <region.icon size={18} strokeWidth={1.5} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-display text-[13px] tracking-[0.06em] text-parchment/90">
                    {region.name}
                    <ArrowRight size={11} className="opacity-0 transition group-hover:opacity-100" />
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-parchment/40">
                    {region.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="parchment-band py-20">
        <div className="container-hall">
          <SectionHeading
            eyebrow="Decrees of note"
            title="Work worth swearing an oath for"
            lede="Open commissions from patrons across the realm. Every purse is funded before the first stroke."
            action={
              <Link to="/jobs" className="btn btn-ghost">
                All open decrees <ArrowRight size={13} />
              </Link>
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(featured ?? []).map((job) => (
              <JobCard key={job.id} job={job} compact />
            ))}
            {!featured &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="panel p-5">
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton mt-4 h-5 w-4/5" />
                  <div className="skeleton mt-2 h-3 w-full" />
                  <div className="skeleton mt-2 h-3 w-2/3" />
                  <div className="skeleton mt-5 h-8 w-28" />
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-hall grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="The oath"
              title="Coin waits. Craft delivers. Then the seal breaks."
              lede="Escrow is not a feature here. It is the ceremony that makes a marketplace feel like a guild."
            />
            <div className="mt-8 space-y-6">
              {[
                {
                  n: "I",
                  title: "Post the decree",
                  body: "State the work, the purse, and the date. The Oracle will help you sharpen a vague brief into a fair scope.",
                  icon: Feather,
                },
                {
                  n: "II",
                  title: "Swear the oath",
                  body: "Choose an artisan and accept a proposal. A contract is drawn, a raven thread opens, and the vault is prepared.",
                  icon: Swords,
                },
                {
                  n: "III",
                  title: "Seal and release",
                  body: "The patron seals the full sum with PayPal. The artisan delivers. The patron inspects, then breaks the seal.",
                  icon: Lock,
                },
              ].map((step) => (
                <div key={step.n} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center border border-gold/30 font-display text-sm text-gold-2">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 font-display text-[15px] text-parchment">
                      {step.title}
                      <step.icon size={13} className="text-gold/50" />
                    </h3>
                    <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-parchment/45">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/oath" className="btn btn-ghost mt-8">
              Read the full oath <ArrowRight size={13} />
            </Link>
          </div>

          <div className="vault ornate-frame relative p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow">The sealed vault</p>
                <p className="mt-3 font-display text-4xl text-gold-2">{money(5720)}</p>
                <p className="mt-1 text-[11px] text-parchment/40">Total held for contract EH-2026-0101</p>
              </div>
              <div className="seal">
                <Sigil size={26} />
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {[
                ["Work delivered", "The artisan submits the final cut", true],
                ["Patron review", "Three days to inspect the delivery", true],
                ["Seal broken", "Coin released to the artisan", false],
              ].map(([title, body, done], index) => (
                <div key={String(title)} className="flex items-start gap-3 border-b border-gold/10 pb-3 last:border-0">
                  <span
                    className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[9px] ${
                      done ? "border-gold/60 bg-gold/15 text-gold-2" : "border-parchment/20 text-parchment/30"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[12px] text-parchment/80">{title}</p>
                    <p className="text-[10px] text-parchment/35">{body}</p>
                  </div>
                  {done && <BadgeCheck size={14} className="text-gold/70" />}
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gold/15 pt-4 text-[9px] uppercase tracking-[0.16em] text-parchment/30">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={11} className="text-gold/60" /> PayPal sandbox escrow</span>
              <span>10% guild tithe</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gold/12 bg-[#0b0907] py-20">
        <div className="container-hall">
          <SectionHeading
            eyebrow="The directory"
            title="Masters of their halls"
            lede="Verified artisans with chronicles of delivered work. Read the record before you swear an oath."
            action={
              <Link to="/artisans" className="btn btn-ghost">
                All artisans <ArrowRight size={13} />
              </Link>
            }
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(artisans?.content ?? []).map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-hall">
          <div className="ornate-frame grid gap-0 overflow-hidden lg:grid-cols-[1.05fr_1fr]">
            <div className="relative p-7 sm:p-10">
              <p className="eyebrow mb-4">Counsel of the hall</p>
              <h2 className="display-section max-w-md text-parchment">
                A second opinion, before the oath.
              </h2>
              <p className="serif-lede mt-4 max-w-md">
                The Oracle reads your decree, your proposal, or your contract and answers plainly. Pricing,
                scope, delivery risk, and the sentence you should send next.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Price the work", "Draft a proposal", "Review scope", "Plan delivery"].map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
              <Link to="/counsel" className="btn btn-gold mt-8">
                Consult the Oracle <Sparkles size={13} />
              </Link>
              <p className="mt-4 text-[10px] text-parchment/30">
                Powered by Spring AI and Groq when a key is present. A local counsel answers when it is not.
              </p>
            </div>

            <div className="relative border-t border-gold/15 bg-[#0a0806] p-6 lg:border-l lg:border-t-0">
              <div className="space-y-4">
                <div className="ml-auto max-w-[85%] border border-gold/25 bg-gold/10 px-4 py-3 text-[12px] leading-relaxed text-parchment/80">
                  My patron wants the vault rebuilt in three weeks. The scope keeps growing. How do I hold the line
                  without losing the work?
                </div>
                <div className="max-w-[92%] border border-parchment/10 bg-white/[0.025] px-4 py-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[8px] uppercase tracking-[0.2em] text-gold/70">
                    <Sparkles size={9} /> The Oracle
                  </p>
                  <p className="ai-text text-[12px] leading-relaxed text-parchment/70">
                    Separate the original oath from the new request. Quote the scope, name the addition, and offer
                    a price and a date for it. Shrink the promise rather than the worth. If the patron needs the
                    date more than the addition, propose a smaller first milestone and seal the rest later.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-parchment/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                  Counsel available to every member
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="parchment-band py-20">
        <div className="container-hall">
          <SectionHeading
            eyebrow="Chronicles"
            title="Words from the hall"
            align="center"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {CHRONICLES.map((item) => (
              <figure key={item.name} className="panel p-6">
                <div className="mb-3">
                  <StarRating rating={5} size={12} />
                </div>
                <blockquote className="font-serif text-[16px] leading-relaxed text-parchment/70">
                  "{item.quote}"
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-parchment/8 pt-4">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-full font-display text-[10px] text-ink"
                    style={{ background: `linear-gradient(145deg, ${item.color}, #17120b)` }}
                  >
                    {item.name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
                  </span>
                  <span>
                    <span className="block text-[11px] text-parchment/75">{item.name}</span>
                    <span className="block text-[9px] uppercase tracking-[0.14em] text-parchment/30">{item.title}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#2a140c] to-transparent" />
        </div>
        <div className="container-hall relative text-center">
          <p className="eyebrow mb-4">The hall is open</p>
          <h2 className="display-section mx-auto max-w-2xl text-parchment">
            Bring the work. We will bring the oath, the vault, and the ravens.
          </h2>
          <p className="serif-lede mx-auto mt-4 max-w-xl">
            Join as a patron or an artisan. The first decree is free to post, and the coin stays sealed until
            you say otherwise.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/join" className="btn btn-gold">
              Enter the hall <ArrowRight size={14} />
            </Link>
            <Link to="/jobs" className="btn btn-ghost">
              Browse open decrees
            </Link>
          </div>
          <p className="mt-6 text-[10px] text-parchment/25">
            Demo accounts are open. Patron and artisan, password: guildhall
          </p>
        </div>
      </section>
    </div>
  );
}
