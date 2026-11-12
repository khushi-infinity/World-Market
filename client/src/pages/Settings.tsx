import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  Coins,
  KeyRound,
  LogOut,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { api, dateLabel, money } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import type { ArtisanProfile, UserSummary } from "../lib/types";
import { REGIONS } from "../lib/regions";
import { PageHeader } from "../components/PageHeader";
import { SigilAvatar } from "../components/SigilAvatar";
import { LoadingHall } from "../components/EmptyState";

const PREF_KEY = "emberhall.ravenPrefs";

interface Prefs {
  proposals: boolean;
  contracts: boolean;
  messages: boolean;
  payments: boolean;
  digest: boolean;
}

const DEFAULT_PREFS: Prefs = {
  proposals: true,
  contracts: true,
  messages: true,
  payments: true,
  digest: false,
};

export function Settings() {
  const { user, setUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    title: "",
    region: "The Forge",
    skills: "",
    hourlyRate: "",
    location: "",
    bio: "",
  });
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.handle],
    queryFn: () => api<ArtisanProfile>(`/artisans/${user?.handle}`),
    enabled: Boolean(user?.handle),
  });

  useEffect(() => {
    if (!user || loaded) return;
    setForm({
      name: user.name,
      title: user.title ?? "",
      region: user.region ?? "The Forge",
      skills: (user.skills ?? []).join(", "),
      hourlyRate: String(user.hourlyRate ?? ""),
      location: user.location ?? "",
      bio: "",
    });
    setLoaded(true);
  }, [user, loaded]);

  useEffect(() => {
    if (profile?.bio) {
      setForm((prev) => (prev.bio ? prev : { ...prev, bio: profile.bio }));
    }
  }, [profile]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREF_KEY);
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...(JSON.parse(stored) as Partial<Prefs>) });
    } catch {
      // keep defaults
    }
  }, []);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = useMutation({
    mutationFn: () =>
      api<UserSummary>("/users/me", {
        method: "PATCH",
        body: {
          name: form.name.trim(),
          title: form.title.trim(),
          region: form.region,
          skills: form.skills.trim(),
          hourlyRate: Number(form.hourlyRate) || 0,
          location: form.location.trim(),
          bio: form.bio,
        },
      }),
    onSuccess: (updated) => {
      setUser(updated);
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast("Your seal is amended. The hall will show the new words.", "success");
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  const togglePref = (key: keyof Prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(PREF_KEY, JSON.stringify(next));
      return next;
    });
  };

  if (!user) return null;

  if (!loaded) {
    return (
      <div className="container-hall">
        <LoadingHall label="Opening your seal" />
      </div>
    );
  }

  const isArtisan = user.role === "ARTISAN";

  return (
    <div>
      <PageHeader
        eyebrow="Your seal"
        title="Amend the words the hall knows you by."
        lede="A clear title and an honest chronicle do more for your next oath than any flourish. Keep it specific."
      />

      <div className="container-hall grid gap-8 py-9 lg:grid-cols-[1fr_330px]">
        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="panel p-6 sm:p-8"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <SigilAvatar name={form.name || user.name} color={user.avatarColor} size={78} verified={user.verified} />
              <div className="flex-1">
                <p className="eyebrow">The public seal</p>
                <h2 className="mt-1 font-display text-xl text-parchment">{form.name || user.name}</h2>
                <p className="mt-0.5 text-[11px] text-parchment/40">@{user.handle}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="badge badge-gold">{isArtisan ? "Artisan" : "Patron"}</span>
                  {user.verified && (
                    <span className="badge badge-moss">
                      <BadgeCheck size={10} /> Seal verified
                    </span>
                  )}
                  <span className="text-[9.5px] uppercase tracking-[0.12em] text-parchment/25">
                    Joined {dateLabel(user.joinedAt)}
                  </span>
                </div>
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (form.name.trim().length < 2) {
                  toast("A name needs at least two characters.", "error");
                  return;
                }
                save.mutate();
              }}
              className="mt-7 space-y-5 border-t border-gold/12 pt-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="settings-name">
                    Name
                  </label>
                  <input
                    id="settings-name"
                    value={form.name}
                    onChange={(event) => set("name", event.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="settings-title">
                    Title
                  </label>
                  <input
                    id="settings-title"
                    value={form.title}
                    onChange={(event) => set("title", event.target.value)}
                    placeholder={isArtisan ? "Illustrator and mapmaker" : "Founder, House Vaelen"}
                    className="input"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="settings-region">
                    Region
                  </label>
                  <select
                    id="settings-region"
                    value={form.region}
                    onChange={(event) => set("region", event.target.value)}
                    className="select"
                  >
                    {form.region && !REGIONS.some((region) => region.name === form.region) && (
                      <option value={form.region}>{form.region}</option>
                    )}
                    {REGIONS.map((region) => (
                      <option key={region.name} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="settings-location">
                    Location
                  </label>
                  <input
                    id="settings-location"
                    value={form.location}
                    onChange={(event) => set("location", event.target.value)}
                    placeholder="Oldtown, by the Citadel"
                    className="input"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="settings-skills">
                    Crafts and tools
                  </label>
                  <input
                    id="settings-skills"
                    value={form.skills}
                    onChange={(event) => set("skills", event.target.value)}
                    placeholder="React, TypeScript, design systems"
                    className="input"
                  />
                  <p className="mt-1.5 text-[9.5px] text-parchment/25">Separate each craft with a comma.</p>
                </div>
                <div>
                  <label className="field-label" htmlFor="settings-rate">
                    Hourly rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] text-parchment/30">$</span>
                    <input
                      id="settings-rate"
                      type="number"
                      min="0"
                      step="1"
                      value={form.hourlyRate}
                      onChange={(event) => set("hourlyRate", event.target.value)}
                      className="input !pl-7"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="settings-bio">
                  Your chronicle
                </label>
                <textarea
                  id="settings-bio"
                  value={form.bio}
                  onChange={(event) => set("bio", event.target.value)}
                  rows={6}
                  className="textarea"
                  placeholder="What you make, how you work, and the kind of oath you keep best."
                />
                <p className="mt-1.5 text-right text-[9px] uppercase tracking-[0.12em] text-parchment/22">
                  {form.bio.length} / 3000
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-parchment/8 pt-5">
                <p className="text-[10px] leading-relaxed text-parchment/30">
                  Your seal is public. Your raven address is never shown.
                </p>
                <button type="submit" disabled={save.isPending} className="btn btn-gold">
                  <Save size={13} /> {save.isPending ? "Sealing..." : "Save the seal"}
                </button>
              </div>
            </form>
          </motion.section>

          <section className="panel p-6">
            <div className="flex items-center gap-2 text-gold/70">
              <Bell size={14} />
              <p className="eyebrow !text-gold/70">Raven preferences</p>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-parchment/40">
              Choose which ravens reach your window. These preferences are kept in this browser.
            </p>

            <div className="mt-5 space-y-1">
              {[
                { key: "proposals" as const, label: "Proposals to my decrees", body: "When an artisan swears an oath on your work." },
                { key: "contracts" as const, label: "Contract movements", body: "Seals, deliveries, releases, and disputes." },
                { key: "messages" as const, label: "New ravens", body: "Direct messages and contract threads." },
                { key: "payments" as const, label: "Treasury lines", body: "Escrow holds and released coin." },
                { key: "digest" as const, label: "A weekly digest", body: "One raven each week with the hall in summary." },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => togglePref(item.key)}
                  className="flex w-full items-center justify-between gap-4 border-b border-parchment/6 py-3 text-left last:border-0"
                >
                  <span>
                    <span className="block text-[11.5px] text-parchment/70">{item.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-parchment/30">{item.body}</span>
                  </span>
                  <span
                    className={`relative h-5 w-9 shrink-0 rounded-full border transition ${
                      prefs[item.key] ? "border-gold/60 bg-gold/25" : "border-parchment/15 bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
                        prefs[item.key] ? "left-[18px] bg-gold" : "left-0.5 bg-parchment/30"
                      }`}
                    />
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel p-6">
            <div className="flex items-center gap-2 text-gold/70">
              <KeyRound size={14} />
              <p className="eyebrow !text-gold/70">Access</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="border border-parchment/10 p-4">
                <p className="text-[9px] uppercase tracking-[0.14em] text-parchment/30">Sign in address</p>
                <p className="mt-1.5 text-[11.5px] text-parchment/70">Held privately by the hall</p>
                <p className="mt-0.5 text-[9.5px] text-parchment/25">Your email is never shown on your seal.</p>
              </div>
              <div className="border border-parchment/10 p-4">
                <p className="text-[9px] uppercase tracking-[0.14em] text-parchment/30">Passphrase</p>
                <p className="mt-1.5 text-[11.5px] text-parchment/70">Eight characters or more</p>
                <p className="mt-0.5 text-[9.5px] text-parchment/25">Contact a warden to rotate a lost passphrase.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-parchment/8 pt-5">
              <div>
                <p className="text-[11.5px] text-parchment/65">Depart this device</p>
                <p className="mt-0.5 text-[10px] text-parchment/30">Your seal remains in the hall, but this device forgets it.</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="btn btn-crimson"
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="panel p-5">
            <p className="eyebrow">At a glance</p>
            <div className="mt-3 space-y-3">
              {[
                { icon: UserRound, label: "Role", value: isArtisan ? "Artisan" : "Patron" },
                { icon: MapPin, label: "Region", value: user.region },
                { icon: ShieldCheck, label: "Oaths kept", value: String(user.completedContracts) },
                { icon: BadgeCheck, label: "Rating", value: user.rating > 0 ? user.rating.toFixed(1) : "Unproven" },
                { icon: Coins, label: "Purse", value: money(user.balance) },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 border-b border-parchment/8 pb-2.5 last:border-0 last:pb-0">
                  <span className="inline-flex items-center gap-2 text-[10.5px] text-parchment/35">
                    <row.icon size={11} className="text-gold/45" /> {row.label}
                  </span>
                  <span className="text-[11px] text-parchment/65">{row.value}</span>
                </div>
              ))}
            </div>
            <Link to={`/artisans/${user.handle}`} className="btn btn-quiet mt-4 w-full">
              View your public seal
            </Link>
          </section>

          <section className="panel relative overflow-hidden p-5">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{ background: "radial-gradient(280px 160px at 85% 0%, rgba(201,162,39,0.14), transparent 70%)" }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-gold/70">
                <Sparkles size={14} />
                <p className="eyebrow !text-gold/70">A better seal</p>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-parchment/42">
                Name the outcome, not the tool. Say what you will not do. A chronicle with edges attracts
                patrons who already know what they want.
              </p>
              <Link to="/counsel" className="btn btn-ghost mt-4 w-full">
                Ask the Oracle to sharpen it
              </Link>
            </div>
          </section>

          <section className="panel p-5">
            <p className="eyebrow">The guild promise</p>
            <ul className="mt-3 space-y-2.5 text-[10.5px] leading-relaxed text-parchment/38">
              <li>Your raven address is never shown on your public seal.</li>
              <li>Coin in escrow is held apart from the guild purse.</li>
              <li>Only you may amend your chronicle and your rates.</li>
              <li>Every contract line remains readable in the ledger.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
