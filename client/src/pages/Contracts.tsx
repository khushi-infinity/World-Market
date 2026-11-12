import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Coins,
  FileText,
  Search,
  ShieldCheck,
  Vault,
} from "lucide-react";
import { api, money, shortDate } from "../lib/api";
import type { Contract, ContractStatus } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { SigilAvatar } from "../components/SigilAvatar";
import { EmptyState, LoadingHall } from "../components/EmptyState";

const FILTERS: { key: string; label: string; match: (status: ContractStatus) => boolean }[] = [
  { key: "all", label: "All oaths", match: () => true },
  {
    key: "active",
    label: "In motion",
    match: (status) => ["AWAITING_FUNDING", "FUNDED", "IN_PROGRESS", "DELIVERED"].includes(status),
  },
  { key: "disputed", label: "Disputed", match: (status) => status === "DISPUTED" },
  { key: "released", label: "Fulfilled", match: (status) => status === "RELEASED" },
  { key: "cancelled", label: "Cancelled", match: (status) => status === "CANCELLED" },
];

export function Contracts() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => api<Contract[]>("/contracts"),
  });

  const filtered = useMemo(() => {
    const active = FILTERS.find((item) => item.key === filter) ?? FILTERS[0];
    const needle = query.trim().toLowerCase();
    return contracts.filter((contract) => {
      if (!active.match(contract.status)) return false;
      if (!needle) return true;
      return (
        contract.jobTitle.toLowerCase().includes(needle) ||
        contract.reference.toLowerCase().includes(needle) ||
        contract.patron.name.toLowerCase().includes(needle) ||
        contract.artisan.name.toLowerCase().includes(needle)
      );
    });
  }, [contracts, filter, query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of FILTERS) {
      map[item.key] = contracts.filter((contract) => item.match(contract.status)).length;
    }
    return map;
  }, [contracts]);

  const heldTotal = contracts
    .filter((contract) => ["FUNDED", "IN_PROGRESS", "DELIVERED", "DISPUTED"].includes(contract.status))
    .reduce((sum, contract) => sum + Number(contract.total), 0);

  if (isLoading) {
    return (
      <div className="container-hall">
        <LoadingHall label="Opening the ledger" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="The ledger of oaths"
        title="Every contract you have sworn."
        lede="A contract is a promise with a vault behind it. Follow each oath from the first seal to the final release."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] uppercase tracking-[0.14em] text-parchment/35">
          <span className="inline-flex items-center gap-1.5">
            <FileText size={11} className="text-gold/60" /> {contracts.length} contracts
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Vault size={11} className="text-gold/60" /> {money(heldTotal)} under seal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-gold/60" /> Escrow on every oath
          </span>
        </div>
      </PageHeader>

      <div className="container-hall py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-parchment/8 pb-px">
            {FILTERS.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`relative shrink-0 px-3.5 pb-3 pt-1 text-[10px] uppercase tracking-[0.16em] transition ${
                    active ? "text-gold" : "text-parchment/35 hover:text-parchment/65"
                  }`}
                >
                  {item.label}
                  <span className={`ml-1.5 text-[9px] ${active ? "text-gold/60" : "text-parchment/20"}`}>
                    {counts[item.key] ?? 0}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="contract-filter"
                      className="absolute inset-x-2 bottom-0 h-px bg-gold"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="search-shell max-w-xs lg:w-72">
            <Search size={14} className="text-parchment/30" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contracts"
              aria-label="Search contracts"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {filtered.length === 0 && (
            <EmptyState
              title="No oaths match that view."
              body="Try another filter, or return to the decree board and begin a new contract."
              action={
                <Link to="/jobs" className="btn btn-gold">
                  The decree board <ArrowRight size={12} />
                </Link>
              }
              icon={<FileText size={30} />}
            />
          )}

          {filtered.map((contract, index) => {
            const other = contract.patronSide ? contract.artisan : contract.patron;
            return (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.25) }}
              >
                <Link
                  to={`/contracts/${contract.id}`}
                  className="panel panel-hover group grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="flex items-start gap-4">
                    <SigilAvatar name={other.name} color={other.avatarColor} size={44} ring={false} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] uppercase tracking-[0.18em] text-parchment/30">
                          {contract.reference}
                        </span>
                        <StatusBadge status={contract.status} />
                      </div>
                      <p className="mt-1.5 font-display text-[1.05rem] leading-snug text-parchment transition group-hover:text-gold-2">
                        {contract.jobTitle}
                      </p>
                      <p className="mt-1 text-[11px] text-parchment/38">
                        {contract.patronSide ? "Artisan" : "Patron"}: {other.name}
                        {contract.dueAt ? ` · due ${shortDate(contract.dueAt)}` : ""}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {contract.jobSkills.slice(0, 4).map((skill) => (
                          <span key={skill} className="tag !text-[8.5px]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 border-t border-parchment/8 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <div className="text-right">
                      <p className="font-display text-lg text-gold-2">{money(contract.total)}</p>
                      <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-parchment/28">
                        {contract.gateway === "PAYPAL"
                          ? "PayPal escrow"
                          : contract.gateway === "CROWN"
                            ? "Crown ledger"
                            : "Vault unsealed"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-parchment/30 transition group-hover:text-gold">
                      Open room <ArrowUpRight size={11} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-parchment/8 pt-5 text-[10px] uppercase tracking-[0.14em] text-parchment/25">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={11} /> Showing {filtered.length} of {contracts.length}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Coins size={11} /> Ten percent guild tithe applies at release
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
