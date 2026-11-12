import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUp, MessageSquare, Search, ShieldCheck, Sparkles } from "lucide-react";
import { api, timeAgo } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useToast } from "../lib/toast";
import { useTopic } from "../lib/realtime";
import type { Conversation, Message } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { SigilAvatar } from "../components/SigilAvatar";
import { EmptyState, LoadingHall } from "../components/EmptyState";

function clock(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function dayLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const sameDay =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  if (sameDay) return clock(value);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const requested = Number(params.get("c") ?? 0);

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const seen = useRef<Set<number>>(new Set());

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api<Conversation[]>("/conversations"),
    refetchInterval: 45000,
  });

  const { data: online } = useQuery({
    queryKey: ["presence"],
    queryFn: () => api<{ ids: number[]; count: number }>("/presence/online"),
    refetchInterval: 30000,
  });

  const active = useMemo(() => {
    if (conversations.length === 0) return null;
    return conversations.find((item) => item.id === requested) ?? conversations[0];
  }, [conversations, requested]);

  const activeId = active?.id ?? null;

  useEffect(() => {
    if (active && active.id !== requested) {
      setParams({ c: String(active.id) }, { replace: true });
    }
  }, [active, requested, setParams]);

  const { data: history } = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => api<Message[]>(`/conversations/${activeId}/messages`),
    enabled: Boolean(activeId),
  });

  useEffect(() => {
    seen.current = new Set();
    setMessages([]);
  }, [activeId]);

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
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  useTopic<Message>(activeId ? `/topic/conversations/${activeId}` : null, addMessage);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = useMutation({
    mutationFn: (body: string) =>
      api<Message>(`/conversations/${activeId}/messages`, { method: "POST", body: { body } }),
    onSuccess: (message) => {
      addMessage(message);
      setDraft("");
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !activeId || send.isPending) return;
    send.mutate(body);
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter(
      (item) =>
        item.other.name.toLowerCase().includes(needle) ||
        item.subject.toLowerCase().includes(needle) ||
        item.lastMessage.toLowerCase().includes(needle),
    );
  }, [conversations, query]);

  if (isLoading) {
    return (
      <div className="container-hall">
        <LoadingHall label="Calling the ravens" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <PageHeader
        eyebrow="The ravenry"
        title="Every thread the hall carries for you."
        lede="Contract threads live here, along with direct ravens. The hall keeps the record, so nothing is lost between seasons."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-parchment/35">
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare size={11} className="text-gold/60" /> {conversations.length} threads
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" /> {online?.count ?? 0}{" "}
            {online?.count === 1 ? "member" : "members"} online
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-gold/60" /> Kept by the guild
          </span>
        </div>
      </PageHeader>

      <div className="container-hall py-8">
        {conversations.length === 0 ? (
          <EmptyState
            title="No ravens have arrived."
            body="Open a thread from an artisan profile, or accept a proposal and the contract thread will appear here."
            icon={<MessageSquare size={30} />}
            action={
              <Link to="/artisans" className="btn btn-gold">
                The artisan directory
              </Link>
            }
          />
        ) : (
          <div className="panel flex h-[calc(100vh-430px)] min-h-[540px] overflow-hidden">
            <aside className={`h-full w-full shrink-0 flex-col border-r border-gold/12 lg:w-[340px] ${active ? "hidden lg:flex" : "flex"}`}>
              <div className="shrink-0 border-b border-gold/12 p-4">
                <div className="search-shell !py-1.5">
                  <Search size={13} className="text-parchment/30" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search threads"
                    aria-label="Search threads"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scroll-thin">
                {filtered.length === 0 && (
                  <p className="px-4 py-8 text-center text-[11px] text-parchment/30">No thread matches that search.</p>
                )}
                {filtered.map((conversation) => {
                  const selected = conversation.id === activeId;
                  const isOnline = online?.ids.includes(conversation.other.id);
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setParams({ c: String(conversation.id) })}
                      className={`relative block w-full border-b border-parchment/6 px-4 py-3.5 text-left transition ${
                        selected ? "bg-gold/[0.07]" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      {selected && <span className="absolute inset-y-0 left-0 w-px bg-gold" />}
                      <div className="flex items-start gap-3">
                        <span className="relative shrink-0">
                          <SigilAvatar
                            name={conversation.other.name}
                            color={conversation.other.avatarColor}
                            size={38}
                            ring={false}
                          />
                          {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0e0c09] bg-moss" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`truncate text-[12px] ${selected ? "text-parchment" : "text-parchment/75"}`}>
                              {conversation.other.name}
                            </p>
                            <span className="shrink-0 text-[8.5px] uppercase tracking-[0.1em] text-parchment/22">
                              {dayLabel(conversation.lastMessageAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[10.5px] text-parchment/38">{conversation.subject}</p>
                          <p className="mt-0.5 truncate text-[10px] text-parchment/28">{conversation.lastMessage}</p>
                          {conversation.contractStatus && (
                            <div className="mt-1.5">
                              <StatusBadge status={conversation.contractStatus} />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className={`h-full min-h-0 flex-1 flex-col ${active ? "flex" : "hidden lg:flex"}`}>
              {active ? (
                <>
                  <div className="flex items-center justify-between gap-3 border-b border-gold/12 px-4 py-3.5 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        onClick={() => setParams({})}
                        className="text-parchment/40 transition hover:text-gold lg:hidden"
                        aria-label="Back to threads"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <SigilAvatar
                        name={active.other.name}
                        color={active.other.avatarColor}
                        size={38}
                        verified={active.other.verified}
                        ring={false}
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/artisans/${active.other.handle}`}
                          className="block truncate font-display text-[14px] text-parchment transition hover:text-gold-2"
                        >
                          {active.other.name}
                        </Link>
                        <p className="truncate text-[9.5px] uppercase tracking-[0.12em] text-parchment/30">
                          {active.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {active.contractId && (
                        <Link to={`/contracts/${active.contractId}`} className="btn btn-quiet !py-1.5 !text-[9px]">
                          Contract room
                        </Link>
                      )}
                    </div>
                  </div>

                  <div ref={chatRef} className="chat-scroll min-h-0 flex flex-1 flex-col gap-3 px-4 py-5 sm:px-5">
                    {messages.length === 0 && (
                      <p className="m-auto max-w-xs text-center text-[11.5px] leading-relaxed text-parchment/30">
                        This thread is open. Send the first raven.
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
                          <div className={`flex max-w-[86%] items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
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

                  <form onSubmit={submit} className="border-t border-gold/12 p-3 sm:p-4">
                    <div className="search-shell !p-1.5">
                      <input
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={`Send a raven to ${active.other.name.split(" ")[0]}...`}
                        aria-label="Message"
                      />
                      <button
                        type="submit"
                        disabled={!draft.trim() || send.isPending}
                        className="btn btn-gold !px-3 !py-2"
                        aria-label="Send"
                      >
                        <ArrowUp size={15} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[8.5px] uppercase tracking-[0.14em] text-parchment/20">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-moss" /> Live thread
                      </span>
                      <Link to="/counsel" className="inline-flex items-center gap-1 transition hover:text-gold">
                        <Sparkles size={9} /> Consult the Oracle
                      </Link>
                    </div>
                  </form>
                </>
              ) : (
                <div className="m-auto text-center text-[12px] text-parchment/30">Choose a thread to open.</div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
