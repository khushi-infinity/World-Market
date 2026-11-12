import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { Sigil } from "../components/Logo";
import { CitadelScene } from "../components/art/CitadelScene";

const DEMOS = [
  {
    label: "Enter as a patron",
    email: "patron@emberhall.io",
    note: "Holds decrees, seals vaults, breaks seals",
  },
  {
    label: "Enter as an artisan",
    email: "artisan@emberhall.io",
    note: "Swears oaths, delivers craft, draws coin",
  },
];

export function Login() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to={next} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const signedIn = await login(email.trim(), password);
      toast(`Welcome back, ${signedIn.name.split(" ")[0]}. The hall remembers you.`, "success");
      navigate(next, { replace: true });
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const useDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("guildhall");
  };

  return (
    <div className="relative min-h-screen overflow-hidden pt-[72px]">
      <div className="absolute inset-0">
        <CitadelScene />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070605] via-[#070605]/85 to-[#070605]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070605] via-transparent to-[#070605]/70" />
      </div>

      <div className="container-hall relative flex min-h-[calc(100vh-72px)] items-center py-14">
        <div className="grid w-full gap-12 lg:grid-cols-[1fr_460px] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden max-w-xl lg:block"
          >
            <p className="eyebrow mb-4">The gates of Emberhall</p>
            <h1 className="display-section text-parchment">
              The hall keeps its promises in <span className="text-gold-2">gold and memory.</span>
            </h1>
            <p className="serif-lede mt-5 max-w-lg">
              Sign in to answer a decree, guard a vault, or read the ravens that arrived while you were away.
              Every oath you swore is still standing here.
            </p>

            <div className="mt-9 space-y-4 border-t border-gold/15 pt-7">
              {[
                { icon: ShieldCheck, text: "Coin is held in escrow until the work is delivered and approved." },
                { icon: Sparkles, text: "The Oracle reads every decree and sharpens every proposal." },
                { icon: KeyRound, text: "Your purse, your oaths, and your chronicle live under one seal." },
              ].map((item) => (
                <p key={item.text} className="flex items-start gap-3 text-[13px] leading-relaxed text-parchment/50">
                  <item.icon size={15} className="mt-0.5 shrink-0 text-gold/70" />
                  {item.text}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="panel relative mx-auto w-full max-w-[460px] p-7 sm:p-9"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

            <div className="flex flex-col items-center text-center">
              <span className="mb-4 inline-flex">
                <Sigil size={40} />
              </span>
              <h2 className="font-display text-xl tracking-[0.1em] text-parchment">RETURN TO THE HALL</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-parchment/40">
                Your seat is warm. The ledger is open.
              </p>
            </div>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <div>
                <label className="field-label" htmlFor="login-email">
                  Raven address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@emberhall.io"
                  className="input"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="field-label !mb-0" htmlFor="login-password">
                    Passphrase
                  </label>
                  <span className="text-[9px] uppercase tracking-[0.14em] text-parchment/25">8+ characters</span>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Speak the words"
                    className="input !pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment/30 transition hover:text-gold"
                    aria-label={showPassword ? "Hide passphrase" : "Show passphrase"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={busy} className="btn btn-gold mt-2 w-full">
                {busy ? "Unbarring the gate..." : "Enter the hall"}
                {!busy && <ArrowRight size={13} />}
              </button>
            </form>

            <div className="mt-7">
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
                <span className="text-[9px] uppercase tracking-[0.16em] text-parchment/30">
                  Or enter with a demo seal
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
              </div>
              <div className="mt-4 grid gap-2">
                {DEMOS.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => useDemo(demo.email)}
                    className="group flex items-center justify-between gap-3 border border-parchment/10 px-3.5 py-3 text-left transition hover:border-gold/35 hover:bg-gold/[0.04]"
                  >
                    <span>
                      <span className="block text-[11px] font-medium text-parchment/75 transition group-hover:text-parchment">
                        {demo.label}
                      </span>
                      <span className="mt-0.5 block text-[9.5px] leading-relaxed text-parchment/30">
                        {demo.note}
                      </span>
                    </span>
                    <ArrowRight size={13} className="shrink-0 text-parchment/25 transition group-hover:text-gold" />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-[9px] uppercase tracking-[0.16em] text-parchment/22">
                Demo passphrase: guildhall
              </p>
            </div>

            <p className="mt-7 border-t border-parchment/8 pt-5 text-center text-[12px] text-parchment/40">
              No seal yet?{" "}
              <Link to="/join" className="link-gold">
                Join the guild
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
