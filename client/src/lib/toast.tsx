import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, TriangleAlert, X } from "lucide-react";

type Tone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastContextValue {
  toast: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: Tone = "info") => {
      const id = ++counter.current;
      setItems((prev) => [...prev.slice(-3), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4600);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[90] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 border px-4 py-3 shadow-2xl backdrop-blur-md ${
                item.tone === "success"
                  ? "border-gold/40 bg-[#17130c]/95"
                  : item.tone === "error"
                    ? "border-crimson/60 bg-[#1a0c0a]/95"
                    : "border-parchment/15 bg-[#12100d]/95"
              }`}
            >
              <span
                className={`mt-0.5 ${
                  item.tone === "success" ? "text-gold" : item.tone === "error" ? "text-[#d77]" : "text-parchment/60"
                }`}
              >
                {item.tone === "success" ? (
                  <Check size={16} />
                ) : item.tone === "error" ? (
                  <TriangleAlert size={16} />
                ) : (
                  <Info size={16} />
                )}
              </span>
              <p className="flex-1 text-sm leading-relaxed text-parchment/90">{item.message}</p>
              <button
                onClick={() => dismiss(item.id)}
                className="text-parchment/40 transition hover:text-parchment"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
