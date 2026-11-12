import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import type { AiResponse, PublicConfig } from "../lib/types";

interface Turn {
  role: "user" | "oracle";
  text: string;
  live?: boolean;
}

const SUGGESTIONS = [
  "How should I price a six week build?",
  "Review the scope of my contract.",
  "Write a sharper proposal opening.",
  "What belongs in a delivery checklist?",
];

export function OracleChat({ variant = "page" }: { variant?: "page" | "dock" }) {
  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: () => api<PublicConfig>("/config"),
    staleTime: 5 * 60 * 1000,
  });

  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "oracle",
      text:
        "I am the Oracle of Emberhall. Ask me about pricing, proposals, scope, delivery, or a dispute that needs a cool head. I will keep my counsel practical.",
    },
  ]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const ask = useMutation({
    mutationFn: (prompt: string) =>
      api<AiResponse>("/ai/counsel", { method: "POST", body: { prompt, context, mode: "counsel" } }),
    onSuccess: (data) => {
      setTurns((prev) => [...prev, { role: "oracle", text: data.text, live: data.live }]);
    },
    onError: (error: Error) => {
      setTurns((prev) => [
        ...prev,
        { role: "oracle", text: `The embers are clouded. ${error.message}` },
      ]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, ask.isPending]);

  const send = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || ask.isPending) return;
    setTurns((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    ask.mutate(trimmed);
  };

  return (
    <div className={`flex flex-col ${variant === "page" ? "h-[calc(100vh-600px)] min-h-[320px]" : "h-full"}`}>
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto scroll-thin px-1 py-2">
        {turns.map((turn, index) => (
          <div key={index} className={turn.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[88%] px-4 py-3 text-[13px] leading-relaxed ${
                turn.role === "user"
                  ? "border border-gold/25 bg-gold/10 text-parchment/90"
                  : "border border-parchment/10 bg-white/[0.025] text-parchment/78"
              }`}
            >
              {turn.role === "oracle" && (
                <div className="mb-1.5 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-gold/70">
                  <Sparkles size={10} />
                  {turn.live ? "The Oracle, live" : "The Oracle, local counsel"}
                </div>
              )}
              <p className="ai-text">{turn.text}</p>
            </div>
          </div>
        ))}
        {ask.isPending && (
          <div className="flex justify-start">
            <div className="border border-gold/15 bg-gold/[0.04] px-4 py-3 text-[12px] italic text-parchment/40">
              The Oracle is reading the embers...
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 shrink-0">
        {turns.length <= 1 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="border border-parchment/12 px-2.5 py-1.5 text-left text-[10px] text-parchment/50 transition hover:border-gold/40 hover:text-parchment/80"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {variant === "page" && (
          <input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Optional context: the decree, the purse, the sticking point."
            className="input mb-2 !py-2 !text-[12px]"
          />
        )}
        <div className="search-shell !p-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(input);
            }}
            placeholder="Ask the Oracle..."
            aria-label="Ask the Oracle"
          />
          <button
            onClick={() => send(input)}
            disabled={ask.isPending || !input.trim()}
            className="btn btn-gold !px-3 !py-2"
            aria-label="Send"
          >
            <ArrowUp size={15} />
          </button>
        </div>
        <p className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-parchment/25">
          <span>{config?.aiConfigured ? "Groq counsel connected" : "Local counsel, no key required"}</span>
          <span>Not legal advice</span>
        </p>
      </div>
    </div>
  );
}
