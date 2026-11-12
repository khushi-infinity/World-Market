import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Coins, Sparkles } from "lucide-react";
import { api, money } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import type { AiResponse, Job } from "../lib/types";
import { REGIONS } from "../lib/regions";
import { PageHeader } from "../components/PageHeader";

export function PostJob() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [aiBusy, setAiBusy] = useState(false);

  const [form, setForm] = useState({
    title: "",
    region: "The Forge",
    description: "",
    skills: "",
    budgetMin: "2000",
    budgetMax: "4000",
    budgetType: "FIXED",
    duration: "4 weeks",
  });

  const set = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const publish = useMutation({
    mutationFn: () =>
      api<Job>("/jobs", {
        method: "POST",
        body: {
          title: form.title,
          description: form.description,
          region: form.region,
          skills: form.skills,
          budgetMin: Number(form.budgetMin),
          budgetMax: Number(form.budgetMax),
          budgetType: form.budgetType,
          duration: form.duration,
        },
      }),
    onSuccess: (job) => {
      toast("The decree is posted. The hall will answer.", "success");
      navigate(`/jobs/${job.id}`);
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  const draftBrief = async () => {
    if (!form.title.trim()) {
      toast("Give the Oracle a title first.", "error");
      return;
    }
    setAiBusy(true);
    try {
      const result = await api<AiResponse>("/ai/brief", {
        method: "POST",
        body: { title: form.title, notes: form.description, region: form.region },
      });
      set("description", result.text);
      toast(result.live ? "The Oracle drafted the brief." : "Local counsel drafted the brief.", "success");
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setAiBusy(false);
    }
  };

  if (user && user.role !== "PATRON") {
    return (
      <div>
        <PageHeader eyebrow="Post a decree" title="The patron seal is required" />
        <div className="container-hall py-12">
          <div className="panel mx-auto max-w-xl p-8 text-center">
            <Coins size={26} className="mx-auto text-gold/70" />
            <h2 className="mt-4 font-display text-xl text-parchment">You are sworn as an artisan.</h2>
            <p className="mt-3 text-sm leading-relaxed text-parchment/45">
              Artisans swear proposals, they do not post decrees. You can still browse the hall, send ravens,
              and answer the work that fits your craft.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link to="/jobs" className="btn btn-gold">Browse decrees</Link>
              <Link to="/dashboard" className="btn btn-ghost">Your hall</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepOneValid = form.title.trim().length >= 10 && form.description.trim().length >= 40;
  const stepTwoValid = Number(form.budgetMin) > 0 && Number(form.budgetMax) >= Number(form.budgetMin);

  return (
    <div>
      <PageHeader
        eyebrow="A new decree"
        title="State the work. Name the purse. Set the date."
        lede="A clear decree attracts better oaths. Be specific about the outcome, the boundaries, and what you will not accept."
      />

      <div className="container-hall grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div className="panel p-6 sm:p-8">
          <div className="stepper mb-8 flex-wrap gap-y-3">
            {["The work", "The purse", "The seal"].map((label, index) => (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className={`step-node ${index < step ? "done" : index === step ? "current" : ""}`}>
                  <span className="node">{index < step ? <Check size={11} /> : index + 1}</span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {index < 2 && <div className="step-bar" />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="field-label" htmlFor="title">Title of the decree</label>
                <input
                  id="title"
                  value={form.title}
                  onChange={(event) => set("title", event.target.value)}
                  placeholder="e.g. Build the guild trading hall in React and Spring"
                  className="input"
                  maxLength={160}
                />
                <p className="mt-1.5 text-[9px] text-parchment/25">A clear title is the first act of good faith.</p>
              </div>

              <div>
                <p className="field-label">The hall</p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {REGIONS.map((region) => (
                    <button
                      key={region.name}
                      type="button"
                      onClick={() => set("region", region.name)}
                      className={`flex items-center gap-2 border px-3 py-2 text-left text-[11px] transition ${
                        form.region === region.name
                          ? "border-gold/45 bg-gold/8 text-parchment"
                          : "border-parchment/10 text-parchment/45 hover:border-parchment/25"
                      }`}
                    >
                      <region.icon size={13} style={{ color: region.accent }} />
                      {region.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="field-label" htmlFor="description">The work</label>
                  <button
                    type="button"
                    onClick={draftBrief}
                    disabled={aiBusy}
                    className="mb-1.5 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-gold/70 transition hover:text-gold"
                  >
                    <Sparkles size={10} /> {aiBusy ? "Drafting..." : "Draft with the Oracle"}
                  </button>
                </div>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  placeholder="What must be built, written, or designed? What is in scope, what is out, and how will you judge the delivery?"
                  className="textarea !min-h-[220px]"
                />
                <p className="mt-1.5 text-[9px] text-parchment/25">{form.description.length} characters. At least 40.</p>
              </div>

              <div>
                <label className="field-label" htmlFor="skills">Skills sought</label>
                <input
                  id="skills"
                  value={form.skills}
                  onChange={(event) => set("skills", event.target.value)}
                  placeholder="React, Spring Boot, PostgreSQL"
                  className="input"
                />
                <p className="mt-1.5 text-[9px] text-parchment/25">Separate with commas. These become the search tags.</p>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!stepOneValid}
                  onClick={() => setStep(1)}
                  className="btn btn-gold"
                >
                  Next: the purse <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="min">Lower purse</label>
                  <input
                    id="min"
                    value={form.budgetMin}
                    onChange={(event) => set("budgetMin", event.target.value.replace(/[^0-9]/g, ""))}
                    className="input"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="max">Upper purse</label>
                  <input
                    id="max"
                    value={form.budgetMax}
                    onChange={(event) => set("budgetMax", event.target.value.replace(/[^0-9]/g, ""))}
                    className="input"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <p className="field-label">Purse type</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { value: "FIXED", label: "Fixed sum", body: "One price for the full scope." },
                    { value: "HOURLY", label: "Hourly rate", body: "Paid for time, estimated in advance." },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => set("budgetType", item.value)}
                      className={`border p-3 text-left transition ${
                        form.budgetType === item.value
                          ? "border-gold/45 bg-gold/8"
                          : "border-parchment/10 hover:border-parchment/25"
                      }`}
                    >
                      <span className="block text-[11px] text-parchment/85">{item.label}</span>
                      <span className="mt-0.5 block text-[10px] text-parchment/35">{item.body}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="duration">Expected duration</label>
                <input
                  id="duration"
                  value={form.duration}
                  onChange={(event) => set("duration", event.target.value)}
                  placeholder="e.g. 4 weeks"
                  className="input"
                />
              </div>

              <div className="border border-gold/20 bg-gold/[0.04] p-4">
                <p className="text-[9px] uppercase tracking-[0.16em] text-gold/70">What the patron pays</p>
                <div className="mt-2 space-y-1 text-[12px] text-parchment/55">
                  <p className="flex justify-between"><span>Artisan purse</span><span>{money(Number(form.budgetMin) || 0)} to {money(Number(form.budgetMax) || 0)}</span></p>
                  <p className="flex justify-between"><span>Guild tithe (10%)</span><span>Added at the seal</span></p>
                  <p className="flex justify-between border-t border-gold/15 pt-1 text-parchment/75"><span>Held in escrow</span><span>Full sum until delivery</span></p>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(0)} className="btn btn-ghost"><ArrowLeft size={13} /> Back</button>
                <button disabled={!stepTwoValid} onClick={() => setStep(2)} className="btn btn-gold">
                  Review the decree <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="eyebrow">As the hall will see it</p>
                <h2 className="mt-2 font-display text-2xl text-parchment">{form.title || "Untitled decree"}</h2>
                <p className="mt-1 text-[11px] text-parchment/35">{form.region} · {form.duration}</p>
              </div>
              <p className="prose-lore max-h-64 overflow-y-auto scroll-thin border-y border-gold/12 py-4 text-[14px]">
                {form.description || "No brief written."}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {form.skills.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="panel-soft p-3">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-parchment/30">Purse</p>
                  <p className="mt-1 font-display text-sm text-gold-2">{money(Number(form.budgetMin))} to {money(Number(form.budgetMax))}</p>
                </div>
                <div className="panel-soft p-3">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-parchment/30">Type</p>
                  <p className="mt-1 font-display text-sm text-parchment/80">{form.budgetType === "FIXED" ? "Fixed sum" : "Hourly"}</p>
                </div>
                <div className="panel-soft p-3">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-parchment/30">Duration</p>
                  <p className="mt-1 font-display text-sm text-parchment/80">{form.duration}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn btn-ghost"><ArrowLeft size={13} /> Back</button>
                <button
                  onClick={() => publish.mutate()}
                  disabled={publish.isPending || !stepOneValid || !stepTwoValid}
                  className="btn btn-gold"
                >
                  {publish.isPending ? "Sealing..." : "Post the decree"} <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <p className="eyebrow">Counsel for patrons</p>
            <ul className="mt-4 space-y-3 text-[11px] leading-relaxed text-parchment/45">
              <li className="flex gap-2"><span className="text-gold/60">I.</span> Name the outcome, not the activity. "A working vault page" beats "some React work".</li>
              <li className="flex gap-2"><span className="text-gold/60">II.</span> State what is out of scope. It protects both sides when the work grows.</li>
              <li className="flex gap-2"><span className="text-gold/60">III.</span> Set a purse you can defend. A low bid attracts a thin oath.</li>
              <li className="flex gap-2"><span className="text-gold/60">IV.</span> Put the delivery date in writing. The vault releases on approval.</li>
            </ul>
            <div className="mt-5 border-t border-parchment/8 pt-4">
              <Link to="/counsel" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-gold/70 hover:text-gold">
                <Sparkles size={11} /> Ask the Oracle for a sharper brief
              </Link>
            </div>
          </div>
          <div className="vault p-5">
            <p className="text-[9px] uppercase tracking-[0.18em] text-gold/60">The promise</p>
            <p className="mt-2 font-serif text-[15px] leading-relaxed text-parchment/60">
              The full purse is sealed before the work begins. No artisan starts on a promise alone, and no patron
              pays for work they have not seen.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
