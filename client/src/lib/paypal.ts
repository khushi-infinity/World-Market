export interface PayPalApproveData {
  orderID: string;
  payerID?: string;
}

export interface PayPalButtonsConfig {
  style?: {
    layout?: "vertical" | "horizontal";
    color?: "gold" | "blue" | "silver" | "white" | "black";
    shape?: "rect" | "pill";
    label?: "paypal" | "checkout" | "buynow" | "pay" | "installment";
    height?: number;
    tagline?: boolean;
  };
  createOrder: () => Promise<string>;
  onApprove: (data: PayPalApproveData) => Promise<void>;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
}

interface PayPalButtonInstance {
  render: (target: HTMLElement) => Promise<void>;
  close?: () => void;
}

interface PayPalNamespace {
  Buttons: (config: PayPalButtonsConfig) => PayPalButtonInstance;
}

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

let loader: Promise<PayPalNamespace> | null = null;

export function loadPayPalSdk(clientId: string, currency: string): Promise<PayPalNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PayPal is only available in the browser."));
  }
  if (window.paypal) {
    return Promise.resolve(window.paypal);
  }
  if (loader) {
    return loader;
  }

  loader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-emberhall-paypal]");
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.paypal) resolve(window.paypal);
        else reject(new Error("The PayPal gate did not open."));
      });
      existing.addEventListener("error", () => reject(new Error("The PayPal gate could not be reached.")));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId,
    )}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`;
    script.async = true;
    script.dataset.emberhallPaypal = "true";
    script.onload = () => {
      if (window.paypal) resolve(window.paypal);
      else reject(new Error("The PayPal gate did not open."));
    };
    script.onerror = () => {
      loader = null;
      reject(new Error("The PayPal gate could not be reached."));
    };
    document.head.appendChild(script);
  });

  return loader;
}
