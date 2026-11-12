import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { loadPayPalSdk } from "../lib/paypal";
import type { Contract, PayPalFunding } from "../lib/types";

export function PayPalSeal({
  contractId,
  clientId,
  currency,
  onFunded,
  onError,
}: {
  contractId: number;
  clientId: string;
  currency: string;
  onFunded: (contract: Contract) => void;
  onError: (message: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    if (!clientId) {
      setState("failed");
      return;
    }

    let cancelled = false;
    let instance: { close?: () => void } | null = null;

    loadPayPalSdk(clientId, currency)
      .then((paypal) => {
        if (cancelled || !host.current) return;
        host.current.innerHTML = "";
        const buttons = paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 44,
            tagline: false,
          },
          createOrder: async () => {
            const funding = await api<PayPalFunding>(`/orders/${contractId}/paypal/create`, {
              method: "POST",
            });
            if (!funding.paypalOrderId) {
              throw new Error("PayPal did not return an order.");
            }
            return funding.paypalOrderId;
          },
          onApprove: async (data) => {
            try {
              const contract = await api<Contract>(`/orders/${contractId}/paypal/capture`, {
                method: "POST",
                body: { paypalOrderId: data.orderID },
              });
              onFunded(contract);
            } catch (error) {
              onError((error as Error).message);
            }
          },
          onCancel: () => onError("The PayPal gate was closed. The vault remains unsealed."),
          onError: () => onError("PayPal could not complete the seal. Try again or use the Crown ledger."),
        });

        instance = buttons;
        void buttons
          .render(host.current)
          .then(() => {
            if (!cancelled) setState("ready");
          })
          .catch(() => {
            if (!cancelled) setState("failed");
          });
      })
      .catch(() => {
        if (!cancelled) setState("failed");
      });

    return () => {
      cancelled = true;
      instance?.close?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId, clientId, currency]);

  if (state === "failed") {
    return (
      <div className="border border-parchment/12 bg-white/[0.02] p-4 text-center">
        <p className="text-[11.5px] leading-relaxed text-parchment/45">
          The PayPal gate could not be opened in this browser. You can still seal the vault with the
          Crown ledger below, or refresh and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {state === "loading" && (
        <div className="flex items-center justify-center gap-2 border border-parchment/12 py-4 text-[10px] uppercase tracking-[0.16em] text-parchment/35">
          <Loader2 size={13} className="animate-spin text-gold/60" />
          Opening the PayPal gate
        </div>
      )}
      <div ref={host} className="min-h-[44px]" />
      {state === "ready" && (
        <p className="mt-2 text-center text-[9px] uppercase tracking-[0.14em] text-parchment/25">
          PayPal sandbox · escrow held by the guild
        </p>
      )}
    </div>
  );
}
