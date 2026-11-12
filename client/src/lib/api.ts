const TOKEN_KEY = "emberhall.token";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

type Options = {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
};

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  if (response.status === 401 && token) {
    setToken(null);
    window.dispatchEvent(new Event("emberhall:unauthorized"));
  }

  if (!response.ok) {
    let message = "The guild scribes could not complete that request.";
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // keep the fallback
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function money(value: number | string | null | undefined, currency = "USD"): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

export function gold(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

export function timeAgo(value: string | null | undefined): string {
  if (!value) return "just now";
  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export function dateLabel(value: string | null | undefined): string {
  if (!value) return "Not yet set";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

export function shortDate(value: string | null | undefined): string {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: "Open decree",
    IN_PROGRESS: "In progress",
    COMPLETED: "Fulfilled",
    CLOSED: "Closed",
    AWAITING_FUNDING: "Awaiting seal",
    FUNDED: "Vault sealed",
    DELIVERED: "Work delivered",
    RELEASED: "Oath fulfilled",
    DISPUTED: "In dispute",
    CANCELLED: "Cancelled",
    PENDING: "Awaiting answer",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    WITHDRAWN: "Withdrawn",
  };
  return labels[status] ?? status;
}

export function statusTone(status: string): string {
  switch (status) {
    case "OPEN":
    case "FUNDED":
    case "ACCEPTED":
    case "RELEASED":
    case "COMPLETED":
      return "gold";
    case "IN_PROGRESS":
    case "DELIVERED":
      return "moss";
    case "DISPUTED":
    case "DECLINED":
      return "crimson";
    case "AWAITING_FUNDING":
    case "PENDING":
      return "steel";
    default:
      return "steel";
  }
}
