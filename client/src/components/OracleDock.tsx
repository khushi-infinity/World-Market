import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Sigil } from "./Logo";
import { OracleChat } from "./OracleChat";

export function OracleDock() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const chatPage =
    pathname === "/counsel" ||
    pathname === "/messages" ||
    /^\/contracts\/[^/]+/.test(pathname);

  if (chatPage) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-[2px] sm:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%", opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.6 }}
              transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed inset-y-0 right-0 z-[75] flex w-full max-w-[440px] flex-col border-l border-gold/25 bg-[#0c0a08] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gold/15 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="oracle-orb !h-9 !w-9">
                    <Sigil size={17} />
                  </span>
                  <div>
                    <p className="font-display text-sm tracking-[0.14em] text-parchment">THE ORACLE</p>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-parchment/35">
                      Counsel of the hall
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-parchment/40 hover:text-gold" aria-label="Close Oracle">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden px-4 pb-4">
                <OracleChat variant="dock" />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-5 right-5 z-[60] flex items-center gap-2.5"
          aria-label="Consult the Oracle"
        >
          <span className="hidden translate-x-2 border border-gold/25 bg-[#0d0b08]/90 px-3 py-2 text-[9px] uppercase tracking-[0.18em] text-parchment/65 opacity-0 backdrop-blur transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block">
            <span className="flex items-center gap-1.5">
              <Sparkles size={10} className="text-gold" />
              Consult the Oracle
            </span>
          </span>
          <span className="oracle-orb">
            <Sigil size={22} />
          </span>
        </button>
      )}
    </>
  );
}
