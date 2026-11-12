import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Coins,
  Crown,
  Landmark,
  Lock,
  Receipt,
  ShieldCheck,
  Vault,
} from "lucide-react";
import { api, dateLabel, money } from "../lib/api";
import { useToast } from "../lib/toast";
import type { LedgerEntry, PublicConfig, Wallet } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { Modal } from "../components/Modal";
import { EmptyState, LoadingHall } from "../components/EmptyState";

const TYPE_COPY: Record<LedgerEntry["type"], { label: string; tone: string }> = {
  ESCROW_HOLD: { label: "Vault sealed", tone: "text-gold" },
  ESCROW_RELEASE: { label: "Escrow released", tone: "text-moss" },
  PLATFORM_FEE: { label: "Guild tithe", tone: "text-parchment/45" },
  DEPOSIT: { label: "Deposit", tone: "text-moss" },
  WITHDRAWAL: { label: "Withdrawal", tone: "text-[#c98a8a]" },
};

export function Treasury() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => api<Wallet>("/wallet"),
  });

  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: () => api<PublicConfig>("/config"),
    staleTime: 5 * 60 * 1000,
  });

  const withdraw = useMutation({
    mutationFn: () =>
      api<Wallet>("/wallet/withdraw", { method: "POST", body: { amount: Number(amount) } }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["wallet"], updated);
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setWithdrawOpen(false);
      setAmount("");
      toast("The coin is sent to the Iron Bank. It will reach your purse shortly.", "success");
    },
    onError: (error: Error) => toast(error.message, "error"),
  });

  if (isLoading || !wallet) {
    return (
      <div className="container-hall">
        <LoadingHall label="Counting the coin" />
      </div>
    );
  }

  const balance = Number(wallet.balance);
  const held = Number(wallet.heldInVault);
  const earned = Number(wallet.lifetimeEarned);
  const total = balance + held;

  return (
    <div>
      <PageHeader
        eyebrow="The treasury"
        title="Coin that answers to the ledger."
        lede="Every hold, release, tithe, and withdrawal is written here. The guild never moves coin without a matching line."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-parchment/35">
          <span className="inline-flex items-center gap-1.5">
            <Receipt size={11} className="text-gold/60" /> {wallet.entries.length} ledger lines
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-gold/60" /> Escrow held by the guild
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Crown size={11} className="text-gold/60" /> {config?.feePercent ?? 10} percent tithe
          </span>
        </div>
      </PageHeader>

      <div className="container-hall py-9">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="panel relative overflow-hidden p-6 sm:p-8"
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(520px 260px at 82% 0%, rgba(201,162,39,0.16), transparent 70%), radial-gradient(420px 240px at 10% 100%, rgba(140,28,28,0.1), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Your purse</p>
                  <p className="mt-3 font-display text-4xl leading-none text-parchment sm:text-5xl">
                    {money(balance)}
                  </p>
                  <p className="mt-2 text-[11px] text-parchment/38">Ready to withdraw to the Iron Bank</p>
                </div>
                <span className="vault">
                  <Coins size={18} />
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gold/12 pt-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-parchment/30">Under seal</p>
                  <p className="mt-1 font-display text-xl text-gold-2">{money(held)}</p>
                  <p className="mt-0.5 text-[9.5px] text-parchment/30">held until delivery</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-parchment/30">Lifetime earned</p>
                  <p className="mt-1 font-display text-xl text-parchment/85">{money(earned)}</p>
                  <p className="mt-0.5 text-[9.5px] text-parchment/30">released through the guild</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setWithdrawOpen(true)}
                  disabled={balance <= 0}
                  className="btn btn-gold"
                >
                  <ArrowDownToLine size={13} /> Withdraw coin
                </button>
                <button onClick={() => setAmount(String(balance))} className="btn btn-ghost" disabled={balance <= 0}>
                  Withdraw all
                </button>
              </div>

              <p className="mt-4 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-parchment/22">
                <Lock size={10} /> Withdrawals settle through the Iron Bank, the guild payment rail
              </p>
            </div>
          </motion.section>

          <section className="panel p-6">
            <p className="eyebrow">The whole ledger</p>
            <p className="mt-3 font-display text-3xl text-parchment">{money(total)}</p>
            <p className="mt-1 text-[11px] text-parchment/38">Purse plus coin under seal</p>

            <div className="mt-6 space-y-4">
              {[
                { icon: Landmark, label: "Purse", value: money(balance), body: "Withdrawable now" },
                { icon: Vault, label: "Escrow", value: money(held), body: "Held for open oaths" },
                { icon: ArrowUpRight, label: "Earned", value: money(earned), body: "Released to your name" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 border-b border-parchment/8 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center border border-gold/18 text-gold/60">
                      <row.icon size={13} />
                    </span>
                    <div>
                      <p className="text-[11.5px] text-parchment/75">{row.label}</p>
                      <p className="text-[9.5px] text-parchment/30">{row.body}</p>
                    </div>
                  </div>
                  <p className="font-display text-[13px] text-parchment/80">{row.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 border border-gold/15 bg-gold/[0.04] p-3.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold/65">How escrow settles</p>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-parchment/42">
                The patron seals the full contract sum. On release, the artisan receives the agreed amount and
                the guild keeps a {config?.feePercent ?? 10} percent tithe. A dispute freezes both sides until a
                warden rules.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">The ledger</p>
              <h2 className="mt-1 font-display text-xl text-parchment">Every line, in order</h2>
            </div>
            <span className="text-[9px] uppercase tracking-[0.14em] text-parchment/25">Most recent fifty</span>
          </div>

          {wallet.entries.length === 0 ? (
            <EmptyState
              title="The ledger is blank."
              body="When an oath is sealed or a delivery is approved, the first line will appear here."
              icon={<Receipt size={30} />}
            />
          ) : (
            <div className="panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-lore min-w-[640px]">
                  <thead>
                    <tr>
                      <th>Entry</th>
                      <th>Detail</th>
                      <th>Contract</th>
                      <th>Date</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.entries.map((entry) => {
                      const copy = TYPE_COPY[entry.type];
                      const sign =
                        entry.type === "WITHDRAWAL" || entry.type === "PLATFORM_FEE"
                          ? "-"
                          : entry.type === "ESCROW_HOLD"
                            ? ""
                            : "+";
                      const tone =
                        entry.type === "ESCROW_RELEASE" || entry.type === "DEPOSIT"
                          ? "text-moss"
                          : entry.type === "WITHDRAWAL" || entry.type === "PLATFORM_FEE"
                            ? "text-[#c98a8a]"
                            : "text-parchment/60";
                      return (
                        <tr key={entry.id}>
                          <td>
                            <span className={`text-[11px] font-medium ${copy.tone}`}>{copy.label}</span>
                          </td>
                          <td className="text-[11px] text-parchment/55">{entry.description}</td>
                          <td className="text-[10px] uppercase tracking-[0.1em] text-parchment/30">
                            {entry.contractReference ?? "Purse"}
                          </td>
                          <td className="text-[10px] text-parchment/35">{dateLabel(entry.createdAt)}</td>
                          <td className={`text-right font-display text-[13px] ${tone}`}>
                            {sign}
                            {money(entry.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Withdraw coin">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = Number(amount);
            if (!value || value <= 0) {
              toast("Name a sum greater than zero.", "error");
              return;
            }
            if (value > balance) {
              toast("Your purse does not hold that much gold.", "error");
              return;
            }
            withdraw.mutate();
          }}
          className="space-y-4"
        >
          <div className="border border-parchment/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-parchment/40">Available</span>
              <span className="font-display text-parchment">{money(balance)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-parchment/40">Under seal</span>
              <span className="text-parchment/60">{money(held)}</span>
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="withdraw-amount">
              Sum to withdraw
            </label>
            <input
              id="withdraw-amount"
              type="number"
              min="1"
              step="1"
              max={balance}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="input"
              placeholder="0"
            />
          </div>

          <div className="flex gap-2">
            {[25, 50, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setAmount(String(Math.floor((balance * pct) / 100)))}
                className="flex-1 border border-parchment/12 py-2 text-[10px] uppercase tracking-[0.12em] text-parchment/45 transition hover:border-gold/35 hover:text-parchment"
              >
                {pct}%
              </button>
            ))}
          </div>

          <p className="text-[10.5px] leading-relaxed text-parchment/35">
            Withdrawals are recorded on the ledger and settle through the Iron Bank. The guild cannot reverse a
            settled withdrawal.
          </p>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setWithdrawOpen(false)} className="btn btn-quiet">
              Keep it here
            </button>
            <button type="submit" disabled={withdraw.isPending} className="btn btn-gold">
              <ArrowDownToLine size={13} /> {withdraw.isPending ? "Sending..." : "Withdraw"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
