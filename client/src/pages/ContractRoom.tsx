import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  Check,
  CheckCircle2,
  Coins,
  Crown,
  FileText,
  Link2,
  Lock,
  MessageSquare,
  ScrollText,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  Vault,
} from "lucide-react";
import { api, dateLabel, money, timeAgo } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { useTopic } from "../lib/realtime";
import type { Contract, Message, PublicConfig } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { SigilAvatar } from "../components/SigilAvatar";
import { PayPalSeal } from "../components/PayPalSeal";
import { Modal } from "../components/Modal";
import { LoadingHall } from "../components/EmptyState";

const STEPS = [
  { key: "sworn", label: "Oath sworn" },
  { key: "sealed", label: "Vault sealed" },
  { key: "delivered", label: "Work delivered" },
  { key: "released", label: "Seal broken" },
];

function stepState(status: string, index: number): "done" | "current" | "todo" {
  const sealed = ["FUNDED", "IN_PROGRESS", "DELIVERED", "RELEASED", "DISPUTED"].includes(status);
  const delivered = ["DELIVERED", "RELEASED"].includes(status);
  const released = status === "RELEASED";

  const done = [true, sealed, delivered, released][index];
  if (done) return "done";

  const previous = [true, sealed, delivered][index - 1];
  return previous ? "current" : "todo";
}

function clock(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function ContractRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [deliverOpen, setDeliverOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [note, setNote] = useState("");
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const chatRef = useRef<HTMLDivElement>(null);
  const seen = useRef<Set<number>>(new Set());

  const { data: contract, isLoading } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => api<Contract>(`/contracts/${id}`),
  });

  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: () => api<PublicConfig>("/config"),
    staleTime: 5 * 60 * 1000,
  });

  const conversationId = contract?.conversationId ?? null;

  const { data: history } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => api<Message[]>(`/conversations/${conversationId}/messages`),
    enabled: Boolean(conversationId),
  });

  useEffect(() => {
    if (!history) return;
    const fresh = history.filter((message) => !seen.current.has(message.id));
    if (fresh.length === 0) return;
    fresh.forEach((message) => seen.current.add(message.id));
    setMessages((prev) => [...prev, ...fresh].sort((a, b) => a.id - b.id));
  }, [history]);

  const addMessage = (message: Message) => {
    if (seen.current.has(message.id)) return;
    seen.current.add(message.id);
    setMessages((prev) => [...prev, message]);
  };

  useTopic<Contract>(
    contract ? `/topic/contracts/${contract.id}` : null,
    (update) => {
      queryClient.setQueryData(["contract", id], update);
      void queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  );

  useTopic<Message>(
    conversationId ? `/topic/conversations/${conversationId}` : null,
    addMessage,
  );

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const refreshContract = (updated: Contract) => {
    queryClient.setQueryData(["contract", id], updated);
    void queryClient.invalidateQueries({ queryKey: ["contracts"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["wallet"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const onError = (message: string) => toast(message, "error");

  const crownFund = useMutation({
    mutationFn: () => api<Contract>(`/orders/${id}/crown/fund`, { method: "POST" }),
    onSuccess: (updated) => {
      refreshContract(updated);
      toast("The vault is sealed with the Crown ledger. The work may begin.", "success");
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  const deliver = useMutation({
    mutationFn: () =>
      api<Contract>(`/orders/${id}/deliver`, {
        method: "POST",
        body: { note: note.trim(), url: deliverableUrl.trim() || null },
      }),
    onSuccess: (updated) => {
      refreshContract(updated);
      setDeliverOpen(false);
      setNote("");
      setDeliverableUrl("");
      toast("The work is delivered. The patron now holds the seal.", "success");
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  const release = useMutation({
    mutationFn: () => api<Contract>(`/orders/${id}/release`, { method: "POST" }),
    onSuccess: (updated) => {
      refreshContract(updated);
      toast("The seal is broken. The coin is released to the artisan.", "success");
      setReviewOpen(true);
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  const dispute = useMutation({
    mutationFn: () =>
      api<Contract>(`/orders/${id}/dispute`, {
        method: "POST",
        body: { reason: disputeReason.trim() },
      }),
    onSuccess: (updated) => {
      refreshContract(updated);
      setDisputeOpen(false);
      setDisputeReason("");
      toast("A dispute is raised. A warden will review the matter.", "success");
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  const review = useMutation({
    mutationFn: () =>
      api(`/orders/${id}/review`, {
        method: "POST",
        body: { rating, comment: reviewComment.trim() },
      }),
    onSuccess: () => {
      setReviewOpen(false);
      setReviewComment("");
      void queryClient.invalidateQueries({ queryKey: ["contract", id] });
      toast("Your chronicle is written. The hall remembers.", "success");
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  const send = useMutation({
    mutationFn: (body: string) =>
      api<Message>(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: { body },
      }),
    onSuccess: (message) => addMessage(message),
    onError: (error: Error) => toast(error.message, "error"),
  });

  const submitMessage = (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !conversationId || send.isPending) return;
    setDraft("");
    send.mutate(body);
  };

  const other = useMemo(() => {
    if (!contract) return null;
    return contract.patronSide ? contract.artisan : contract.patron;
  }, [contract]);

  if (isLoading || !contract || !user) {
    return (
      <div className="container-hall">
        <LoadingHall label="Unsealing the contract" />
      </div>
    );
  }

  const isPatron = contract.patronSide;
  const canFund = isPatron && contract.status === "AWAITING_FUNDING";
  const canDeliver = !isPatron && ["FUNDED", "IN_PROGRESS"].includes(contract.status);
  const canRelease = isPatron && contract.status === "DELIVERED";
  const canDispute = ["FUNDED", "IN_PROGRESS", "DELIVERED"].includes(contract.status);
  const canReview = isPatron && contract.status === "RELEASED" && !contract.reviewed;
  const paypalReady = Boolean(config?.paypalConfigured && config.paypalClientId);

  const counterpart = other;

  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Link to="/contracts" className="inline-flex items-center gap-1 text-parchment/40 transition hover:text-gold">
              <ArrowLeft size={12} /> The ledger
            </Link>
            <span className="text-parchment/20">/</span>
            {contract.reference}
          </span>
        }
        title={contract.jobTitle}
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={contract.status} />
          <span className="badge badge-steel">
            {contract.gateway === "PAYPAL" ? "PayPal escrow" : contract.gateway === "CROWN" ? "Crown ledger" : "Vault unsealed"}
          </span>
          <span className="text-[10px] text-parchment/30">Sworn {dateLabel(contract.createdAt)}</span>
          {contract.dueAt && (
            <span className="text-[10px] text-parchment/30">Due {dateLabel(contract.dueAt)}</span>
          )}
        </div>
      </PageHeader>

      <div className="container-hall py-8">
        <div className="panel mb-6 p-5 sm:px-7">
          <div className="stepper flex-wrap gap-y-3">
            {STEPS.map((step, index) => {
              const state = contract.status === "CANCELLED" ? "todo" : stepState(contract.status, index);
              return (
                <div key={step.key} className="flex flex-1 items-center last:flex-none">
                  <div className={`step-node ${state}`}>
                    <span className="node">
                      {state === "done" ? <Check size={11} /> : index + 1}
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </div>
                  {index < STEPS.length - 1 && <div className="step-bar" />}
                </div>
              );
            })}
          </div>

          {contract.status === "DISPUTED" && (
            <div className="mt-4 flex items-start gap-3 border border-crimson/40 bg-crimson/[0.08] p-3.5">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#d77]" />
              <div>
                <p className="text-[11.5px] font-medium text-parchment/85">This oath is in dispute.</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-parchment/45">
                  {contract.disputeReason || "A warden is reviewing the matter. The vault is frozen until a ruling."}
                </p>
              </div>
            </div>
          )}

          {contract.status === "RELEASED" && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-moss/35 bg-moss/[0.06] p-3.5">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-moss" />
                <div>
                  <p className="text-[11.5px] font-medium text-parchment/85">The oath is fulfilled.</p>
                  <p className="mt-0.5 text-[11px] text-parchment/45">
                    {money(contract.amount)} released to {contract.artisan.name} on {dateLabel(contract.releasedAt)}.
                  </p>
                </div>
              </div>
              {canReview && (
                <button onClick={() => setReviewOpen(true)} className="btn btn-gold !py-2 !text-[10px]">
                  <Star size={12} /> Write a chronicle
                </button>
              )}
              {isPatron && contract.reviewed && (
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-moss">
                  <BadgeCheck size={12} /> Chronicle written
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <section className="panel relative overflow-hidden p-6 sm:p-7">
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    "radial-gradient(420px 220px at 85% 0%, rgba(201,162,39,0.13), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">The vault</p>
                    <h2 className="mt-1.5 font-display text-xl text-parchment">
                      {contract.status === "AWAITING_FUNDING"
                        ? "The coin is not yet sealed."
                        : contract.status === "RELEASED"
                          ? "The vault has been opened."
                          : "Coin held until delivery."}
                    </h2>
                  </div>
                  <span className={`vault ${contract.status === "AWAITING_FUNDING" ? "opacity-45" : ""}`}>
                    <Vault size={18} />
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="border border-parchment/8 bg-white/[0.015] p-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-parchment/30">Artisan receives</p>
                    <p className="mt-1.5 font-display text-lg text-parchment">{money(contract.amount)}</p>
                  </div>
                  <div className="border border-parchment/8 bg-white/[0.015] p-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-parchment/30">Guild tithe</p>
                    <p className="mt-1.5 font-display text-lg text-parchment/70">{money(contract.fee)}</p>
                  </div>
                  <div className="border border-gold/25 bg-gold/[0.05] p-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-gold/60">
                      {contract.status === "AWAITING_FUNDING" ? "To seal" : "Held in vault"}
                    </p>
                    <p className="mt-1.5 font-display text-lg text-gold-2">{money(contract.total)}</p>
                  </div>
                </div>

                {canFund && (
                  <div className="mt-6 border-t border-gold/12 pt-5">
                    <p className="field-label">Seal the vault</p>
                    <p className="mb-4 text-[12px] leading-relaxed text-parchment/45">
                      The full sum is held by the guild. {contract.artisan.name.split(" ")[0]} sees that the coin
                      is real before lifting a tool. Nothing is released until you approve the delivery.
                    </p>

                    <div className="space-y-3">
                      {paypalReady && config ? (
                        <PayPalSeal
                          contractId={contract.id}
                          clientId={config.paypalClientId}
                          currency={config.currency}
                          onFunded={(updated) => {
                            refreshContract(updated);
                            toast("PayPal has sealed the vault. The work may begin.", "success");
                          }}
                          onError={onError}
                        />
                      ) : (
                        <div className="border border-parchment/12 bg-white/[0.02] p-3.5">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-parchment/35">
                            PayPal sandbox not configured
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-parchment/40">
                            Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to the server environment to take live
                            sandbox payments. Until then the Crown ledger stands in.
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => crownFund.mutate()}
                        disabled={crownFund.isPending}
                        className="btn btn-ghost w-full"
                      >
                        <Crown size={13} />
                        {crownFund.isPending ? "Sealing the vault..." : "Seal with the Crown ledger"}
                      </button>
                    </div>

                    <p className="mt-3 flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-parchment/25">
                      <Lock size={10} /> Escrow held by the guild until release
                    </p>
                  </div>
                )}

                {canRelease && (
                  <div className="mt-6 border-t border-gold/12 pt-5">
                    <p className="field-label">The delivery awaits your seal</p>
                    <p className="mb-4 text-[12px] leading-relaxed text-parchment/45">
                      Inspect the work below. Breaking the seal releases {money(contract.amount)} to{" "}
                      {contract.artisan.name}. This cannot be undone.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => release.mutate()}
                        disabled={release.isPending}
                        className="btn btn-gold flex-1"
                      >
                        <CheckCircle2 size={13} />
                        {release.isPending ? "Breaking the seal..." : "Break the seal and release"}
                      </button>
                      <button onClick={() => setDisputeOpen(true)} className="btn btn-crimson">
                        <AlertTriangle size={13} /> Dispute
                      </button>
                    </div>
                  </div>
                )}

                {canDeliver && (
                  <div className="mt-6 border-t border-gold/12 pt-5">
                    <p className="field-label">Deliver the work</p>
                    <p className="mb-4 text-[12px] leading-relaxed text-parchment/45">
                      When the craft is ready, present it here with a short note and a link. The patron will
                      inspect it and break the seal.
                    </p>
                    <button onClick={() => setDeliverOpen(true)} className="btn btn-gold w-full sm:w-auto">
                      <Upload size={13} /> Present the delivery
                    </button>
                  </div>
                )}

                {!canFund && !canRelease && !canDeliver && contract.status !== "RELEASED" && contract.status !== "DISPUTED" && (
                  <div className="mt-6 border-t border-gold/12 pt-5">
                    <p className="text-[12px] leading-relaxed text-parchment/40">
                      {contract.status === "FUNDED" || contract.status === "IN_PROGRESS"
                        ? isPatron
                          ? "The vault is sealed. The artisan is at work. The next move is theirs."
                          : "The vault is sealed. Present the work when it is ready."
                        : contract.status === "CANCELLED"
                          ? "This contract was cancelled. No coin moved and no oath remains."
                          : "There is no action for you at this stage of the oath."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {(contract.deliverableNote || contract.deliverableUrl) && (
              <section className="panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow">The delivery</p>
                    <h2 className="mt-1 font-display text-lg text-parchment">Presented by {contract.artisan.name}</h2>
                  </div>
                  <span className="badge badge-moss">
                    <Check size={10} /> Delivered {timeAgo(contract.deliveredAt)}
                  </span>
                </div>
                {contract.deliverableNote && (
                  <p className="prose-lore mt-4 whitespace-pre-line">{contract.deliverableNote}</p>
                )}
                {contract.deliverableUrl && (
                  <a
                    href={contract.deliverableUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost mt-4"
                  >
                    <Link2 size={13} /> Open the delivered work
                  </a>
                )}
              </section>
            )}

            <section className="panel p-6">
              <p className="eyebrow">The decree</p>
              <h2 className="mt-1 font-display text-lg text-parchment">What was sworn</h2>
              <p className="prose-lore mt-4 whitespace-pre-line">{contract.jobDescription}</p>
              <div className="mt-5 flex flex-wrap gap-1.5 border-t border-gold/12 pt-4">
                {contract.jobSkills.map((skill) => (
                  <span key={skill} className="tag">
                    {skill}
                  </span>
                ))}
              </div>
              <Link to={`/jobs/${contract.jobId}`} className="link-gold mt-4 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em]">
                <ScrollText size={11} /> View the original decree
              </Link>
            </section>

            <section className="panel p-6">
              <p className="eyebrow">The terms</p>
              <h2 className="mt-1 font-display text-lg text-parchment">What both sides agreed</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-3 text-[11px] sm:grid-cols-2">
                {[
                  ["Reference", contract.reference],
                  ["Sworn", dateLabel(contract.createdAt)],
                  ["Vault sealed", contract.fundedAt ? dateLabel(contract.fundedAt) : "Not yet"],
                  ["Delivered", contract.deliveredAt ? dateLabel(contract.deliveredAt) : "Not yet"],
                  ["Due", contract.dueAt ? dateLabel(contract.dueAt) : "Not set"],
                  ["Gateway", contract.gateway === "PAYPAL" ? "PayPal" : contract.gateway === "CROWN" ? "Crown ledger" : "None"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 border-b border-parchment/6 pb-2.5 last:border-0"
                  >
                    <dt className="text-parchment/32">{label}</dt>
                    <dd className="text-right text-parchment/65">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="panel p-6">
              <p className="eyebrow">The chronicle</p>
              <h2 className="mt-1 font-display text-lg text-parchment">How this oath has moved</h2>
              <div className="timeline mt-5">
                {[
                  {
                    label: "Oath sworn",
                    at: contract.createdAt,
                    done: true,
                    current: false,
                    body: `${contract.patron.name} accepted the proposal of ${contract.artisan.name}.`,
                  },
                  {
                    label: "Vault sealed",
                    at: contract.fundedAt,
                    done: Boolean(contract.fundedAt),
                    current: contract.status === "AWAITING_FUNDING",
                    body: contract.fundedAt
                      ? `${money(contract.total)} was placed in escrow and held by the guild.`
                      : "The patron has not yet sealed the vault.",
                  },
                  {
                    label: "Work delivered",
                    at: contract.deliveredAt,
                    done: Boolean(contract.deliveredAt),
                    current: ["FUNDED", "IN_PROGRESS"].includes(contract.status),
                    body: contract.deliveredAt
                      ? "The artisan presented the work for the patron's inspection."
                      : "The artisan will present the work here when it is ready.",
                  },
                  {
                    label: "Seal broken",
                    at: contract.releasedAt,
                    done: Boolean(contract.releasedAt),
                    current: contract.status === "DELIVERED",
                    body: contract.releasedAt
                      ? `${money(contract.amount)} was released to ${contract.artisan.name}.`
                      : "The vault opens only when the patron approves the delivery.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`timeline-item ${item.done ? "done" : ""} ${item.current ? "current" : ""}`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-[13px] text-parchment/85">{item.label}</p>
                      <span className="text-[9px] uppercase tracking-[0.12em] text-parchment/25">
                        {item.at ? dateLabel(item.at) : item.current ? "In motion" : "Pending"}
                      </span>
                    </div>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-parchment/38">{item.body}</p>
                  </div>
                ))}

                {contract.status === "DISPUTED" && (
                  <div className="timeline-item current">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-[13px] text-[#d9a0a0]">A dispute is raised</p>
                      <span className="text-[9px] uppercase tracking-[0.12em] text-parchment/25">Frozen</span>
                    </div>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-parchment/38">
                      {contract.disputeReason || "A warden is reviewing the matter."}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-gold/15 px-5 py-4">
                <div>
                  <p className="eyebrow">Ravens</p>
                  <h2 className="mt-1 font-display text-base text-parchment">The contract thread</h2>
                </div>
                <MessageSquare size={15} className="text-gold/50" />
              </div>

              <div
                ref={chatRef}
                className="chat-scroll flex h-[380px] flex-col gap-3 px-4 py-4 lg:h-[440px]"
              >
                {messages.length === 0 && (
                  <p className="m-auto max-w-[240px] text-center text-[11.5px] leading-relaxed text-parchment/30">
                    No ravens in this thread yet. Open the conversation with a question or a courtesy.
                  </p>
                )}
                {messages.map((message) => {
                  if (message.system) {
                    return (
                      <div key={message.id} className="bubble bubble-system">
                        {message.body}
                      </div>
                    );
                  }
                  const mine = message.sender.id === user.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`flex max-w-[88%] items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                        <SigilAvatar
                          name={message.sender.name}
                          color={message.sender.avatarColor}
                          size={24}
                          ring={false}
                        />
                        <div>
                          <div className={`bubble ${mine ? "bubble-mine" : ""}`}>
                            <p className="whitespace-pre-line">{message.body}</p>
                          </div>
                          <p className={`mt-1 text-[8.5px] text-parchment/25 ${mine ? "text-right" : ""}`}>
                            {clock(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={submitMessage} className="border-t border-gold/15 p-3">
                <div className="search-shell !p-1.5">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={conversationId ? "Send a raven..." : "No thread is attached"}
                    disabled={!conversationId}
                    aria-label="Message"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || send.isPending || !conversationId}
                    className="btn btn-gold !px-3 !py-2"
                    aria-label="Send raven"
                  >
                    <ArrowUp size={15} />
                  </button>
                </div>
                <p className="mt-2 text-center text-[8.5px] uppercase tracking-[0.14em] text-parchment/20">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-moss" /> Live thread
                  </span>
                </p>
              </form>
            </section>

            {counterpart && (
              <section className="panel p-5">
                <p className="eyebrow">{isPatron ? "Your artisan" : "Your patron"}</p>
                <div className="mt-3 flex items-center gap-3">
                  <SigilAvatar
                    name={counterpart.name}
                    color={counterpart.avatarColor}
                    size={46}
                    verified={counterpart.verified}
                  />
                  <div>
                    <p className="font-display text-[14px] text-parchment">{counterpart.name}</p>
                    <p className="text-[10.5px] text-parchment/40">{counterpart.title}</p>
                    <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-parchment/25">
                      {counterpart.region}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 divide-x divide-parchment/10 border-y border-parchment/8 py-3 text-center">
                  <div>
                    <p className="font-display text-base text-parchment">{counterpart.completedContracts}</p>
                    <p className="text-[8px] uppercase tracking-[0.14em] text-parchment/30">Oaths kept</p>
                  </div>
                  <div>
                    <p className="font-display text-base text-gold-2">{counterpart.rating.toFixed(1)}</p>
                    <p className="text-[8px] uppercase tracking-[0.14em] text-parchment/30">Rating</p>
                  </div>
                </div>
                <Link to={`/artisans/${counterpart.handle}`} className="btn btn-quiet mt-3 w-full">
                  <FileText size={12} /> View their chronicle
                </Link>
              </section>
            )}

            <section className="panel p-5">
              <div className="flex items-center gap-2 text-gold/70">
                <ShieldCheck size={14} />
                <p className="eyebrow !text-gold/70">How the vault works</p>
              </div>
              <ul className="mt-3 space-y-2.5 text-[10.5px] leading-relaxed text-parchment/40">
                <li className="flex gap-2">
                  <Coins size={12} className="mt-0.5 shrink-0 text-gold/45" />
                  The patron seals the full sum before work begins.
                </li>
                <li className="flex gap-2">
                  <Upload size={12} className="mt-0.5 shrink-0 text-gold/45" />
                  The artisan presents the delivery in this room.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-gold/45" />
                  The patron inspects, then breaks the seal to release.
                </li>
                <li className="flex gap-2">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0 text-gold/45" />
                  A dispute freezes the vault until a warden rules.
                </li>
              </ul>
              <Link to="/counsel" className="btn btn-quiet mt-4 w-full">
                <Sparkles size={12} /> Ask the Oracle about this oath
              </Link>
            </section>

            {canDispute && (
              <button
                onClick={() => setDisputeOpen(true)}
                className="w-full border border-crimson/25 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[#c98a8a] transition hover:border-crimson/60 hover:text-[#e0a5a5]"
              >
                <AlertTriangle size={11} className="mr-1.5 inline" /> Raise a dispute
              </button>
            )}
          </aside>
        </div>
      </div>

      <Modal open={deliverOpen} onClose={() => setDeliverOpen(false)} title="Present the delivery">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (note.trim().length < 10) {
              toast("Add a note of at least ten characters so the patron knows what to inspect.", "error");
              return;
            }
            deliver.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="field-label" htmlFor="deliver-note">
              A note for the patron
            </label>
            <textarea
              id="deliver-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={5}
              className="textarea"
              placeholder="What was made, what to inspect first, and anything left open."
            />
          </div>
          <div>
            <label className="field-label" htmlFor="deliver-url">
              Link to the work <span className="normal-case tracking-normal text-parchment/25">(optional)</span>
            </label>
            <input
              id="deliver-url"
              value={deliverableUrl}
              onChange={(event) => setDeliverableUrl(event.target.value)}
              placeholder="https://..."
              className="input"
            />
          </div>
          <div className="border border-gold/15 bg-gold/[0.04] p-3.5 text-[10.5px] leading-relaxed text-parchment/45">
            Delivery does not move coin. It hands the seal to the patron, who inspects the work before release.
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDeliverOpen(false)} className="btn btn-quiet">
              Not yet
            </button>
            <button type="submit" disabled={deliver.isPending} className="btn btn-gold">
              <Send size={13} /> {deliver.isPending ? "Sending..." : "Deliver the work"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={disputeOpen} onClose={() => setDisputeOpen(false)} title="Raise a dispute">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (disputeReason.trim().length < 10) {
              toast("Explain the matter in at least ten characters.", "error");
              return;
            }
            dispute.mutate();
          }}
          className="space-y-4"
        >
          <div className="flex items-start gap-3 border border-crimson/30 bg-crimson/[0.07] p-3.5">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#d77]" />
            <p className="text-[11px] leading-relaxed text-parchment/55">
              A dispute freezes the vault and summons a warden. Speak plainly and name the promise that
              was not kept. Both sides will be heard before a ruling.
            </p>
          </div>
          <div>
            <label className="field-label" htmlFor="dispute-reason">
              The matter
            </label>
            <textarea
              id="dispute-reason"
              value={disputeReason}
              onChange={(event) => setDisputeReason(event.target.value)}
              rows={5}
              className="textarea"
              placeholder="What was promised, what arrived, and what you ask the warden to do."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDisputeOpen(false)} className="btn btn-quiet">
              Keep the peace
            </button>
            <button type="submit" disabled={dispute.isPending} className="btn btn-crimson">
              {dispute.isPending ? "Raising..." : "Raise the dispute"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title="Write a chronicle">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            review.mutate();
          }}
          className="space-y-4"
        >
          <p className="text-[12px] leading-relaxed text-parchment/45">
            The chronicle follows {contract.artisan.name} to their next oath. Be honest, be specific, and
            say what a future patron should know.
          </p>
          <div>
            <p className="field-label">Your rating</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`grid h-9 w-9 place-items-center border transition ${
                    value <= rating
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-parchment/12 text-parchment/20 hover:border-gold/30"
                  }`}
                  aria-label={`${value} stars`}
                >
                  <Star size={15} fill={value <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="review-comment">
              The chronicle
            </label>
            <textarea
              id="review-comment"
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              rows={5}
              className="textarea"
              placeholder="What was the work like, and would you swear another oath with them?"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setReviewOpen(false)} className="btn btn-quiet">
              Later
            </button>
            <button type="submit" disabled={review.isPending} className="btn btn-gold">
              {review.isPending ? "Writing..." : "Seal the chronicle"}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
