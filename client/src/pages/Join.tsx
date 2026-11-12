import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Hammer,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { REGIONS } from "../lib/regions";
import { Sigil } from "../components/Logo";
import { RealmMap } from "../components/art/RealmMap";

type Role = "PATRON" | "ARTISAN";

const ROLE_COPY: Record<Role, { title: string; body: string; icon: typeof Hammer; perks: string[] }> = {
  PATRON: {
    title: "I come to commission",
    body: "Post a decree, compare oaths, and hold the coin in escrow until the work earns it.",
    icon: ScrollText,
    perks: ["Post unlimited decrees", "Vault held until you approve", "Oracle help with every brief"],
  },
  ARTISAN: {
    title: "I come to craft",
    body: "Swear proposals, keep the work honest, and draw your coin the moment the seal breaks.",
    icon: Hammer,
    perks: ["A chronicle of your craft", "Escrow that protects the work", "Direct ravens with patrons"],
  },
};

export function Join() {
  const { user, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("PATRON");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    title: "",
    region: "The Forge",
    handle: "",
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (form.password.length < 8) {
      toast("A passphrase needs at least eight characters.", "error");
      return;
    }
    setBusy(true);
    try {
      const created = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        title: form.title.trim() || (role === "ARTISAN" ? "Artisan of the hall" : "Patron of the hall"),
        region: form.region,
        handle: form.handle.trim() || undefined,
      });
      toast(`Your seal is struck, ${created.name.split(" ")[0]}. Welcome to Emberhall.`, "success");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const active = ROLE_COPY[role];

  return (
    <div className="relative min-h-screen overflow-hidden pt-[72px]">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <RealmMap />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080706]/80 via-[#080706]/90 to-[#080706]" />
      </div>

      <div className="container-hall relative grid gap-10 py-14 lg:grid-cols-[420px_1fr] lg:items-start">
        <motion.aside
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="order-2 lg:order-1 lg:sticky lg:top-24"
        >
          <div className="panel p-6 sm:p-7">
            <span className="inline-flex">
              <Sigil size={34} />
            </span>
            <p className="eyebrow mt-5">Why the hall exists</p>
            <h2 className="mt-2 font-display text-xl leading-snug text-parchment">
              Work that is sworn, not merely promised.
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-parchment/45">
              Emberhall is a guild market for independent craft. The patron names the work. The artisan
              swears an oath. The coin waits in a vault until the delivery is real.
            </p>

            <div className="mt-6 space-y-4 border-t border-gold/12 pt-5">
              {[
                { icon: ShieldCheck, label: "Escrow by default", body: "No release without delivery." },
                { icon: Coins, label: "Ten percent tithe", body: "One clear fee, held by the guild." },
                { icon: BadgeCheck, label: "Reputation that travels", body: "Chronicles follow every oath." },
                { icon: Sparkles, label: "The Oracle", body: "Counsel on scope, price, and disputes." },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-gold/20 text-gold/75">
                    <item.icon size={14} />
                  </span>
                  <div>
                    <p className="text-[11.5px] font-medium text-parchment/80">{item.label}</p>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-parchment/35">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-parchment/8 pt-5 text-[10px] text-parchment/30">
              <Users size={12} className="text-gold/50" />
              Twelve artisans already keep the hall.
            </div>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="order-1 lg:order-2"
        >
          <p className="eyebrow">Take your seat</p>
          <h1 className="display-section mt-3 max-w-2xl text-parchment">
            Strike your seal and join the <span className="text-gold-2">guild market.</span>
          </h1>
          <p className="serif-lede mt-4 max-w-xl">
            Choose the side of the table you sit on. You can change your craft later, but the hall
            always knows an honest hand.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {(Object.keys(ROLE_COPY) as Role[]).map((key) => {
              const copy = ROLE_COPY[key];
              const selected = role === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={`group relative border p-5 text-left transition ${
                    selected
                      ? "border-gold/55 bg-gold/[0.07]"
                      : "border-parchment/10 bg-white/[0.015] hover:border-gold/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={selected ? "text-gold" : "text-parchment/40"}>
                      <copy.icon size={18} />
                    </span>
                    <span
                      className={`grid h-4 w-4 place-items-center rounded-full border ${
                        selected ? "border-gold bg-gold text-ink" : "border-parchment/25"
                      }`}
                    >
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
                    </span>
                  </div>
                  <p className="mt-4 font-display text-[15px] text-parchment">{copy.title}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-parchment/40">{copy.body}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="panel mt-5 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="join-name">
                  Your name
                </label>
                <input
                  id="join-name"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  placeholder="A name the hall will remember"
                  className="input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="join-email">
                  Raven address
                </label>
                <input
                  id="join-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => set("email", event.target.value)}
                  placeholder="you@emberhall.io"
                  className="input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="join-password">
                  Passphrase
                </label>
                <input
                  id="join-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => set("password", event.target.value)}
                  placeholder="Eight characters or more"
                  className="input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="join-title">
                  Your title
                </label>
                <input
                  id="join-title"
                  value={form.title}
                  onChange={(event) => set("title", event.target.value)}
                  placeholder={role === "ARTISAN" ? "Illustrator and mapmaker" : "Founder, House Vaelen"}
                  className="input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="join-handle">
                  Handle <span className="normal-case tracking-normal text-parchment/25">(optional)</span>
                </label>
                <input
                  id="join-handle"
                  value={form.handle}
                  onChange={(event) => set("handle", event.target.value)}
                  placeholder="ravenwright"
                  className="input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="join-region">
                  Your region
                </label>
                <select
                  id="join-region"
                  value={form.region}
                  onChange={(event) => set("region", event.target.value)}
                  className="select"
                >
                  {REGIONS.map((region) => (
                    <option key={region.name} value={region.name}>
                      {region.name} · {region.tagline}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 border border-gold/15 bg-gold/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold/70">{active.title}</p>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-3">
                {active.perks.map((perk) => (
                  <li key={perk} className="text-[10.5px] leading-relaxed text-parchment/45">
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            <button type="submit" disabled={busy} className="btn btn-gold mt-5 w-full">
              {busy ? "Striking your seal..." : "Strike the seal and enter"}
              {!busy && <ArrowRight size={13} />}
            </button>

            <p className="mt-4 text-center text-[12px] text-parchment/40">
              Already sworn?{" "}
              <Link to="/login" className="link-gold">
                Return to the hall
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
