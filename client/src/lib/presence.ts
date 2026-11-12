import { useEffect } from "react";
import { api } from "./api";
import { useAuth } from "./auth";

export function usePresenceHeartbeat() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const ping = () => {
      void api("/presence/ping", { method: "POST", body: { userId: user.id } }).catch(() => undefined);
    };
    ping();
    const timer = window.setInterval(ping, 25000);
    return () => window.clearInterval(timer);
  }, [user]);
}
