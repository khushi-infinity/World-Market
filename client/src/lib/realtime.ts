import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

function socketUrl(): string {
  const explicit = import.meta.env.VITE_WS_URL as string | undefined;
  if (explicit) return explicit;
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws`;
}

export function useTopic<T>(destination: string | null, onMessage: (payload: T) => void, enabled = true) {
  const handler = useRef(onMessage);
  handler.current = onMessage;

  useEffect(() => {
    if (!destination || !enabled) return;
    const client = new Client({
      brokerURL: socketUrl(),
      reconnectDelay: 4000,
      heartbeatIncoming: 12000,
      heartbeatOutgoing: 12000,
      debug: () => {},
    });

    let subscription: { unsubscribe: () => void } | null = null;
    client.onConnect = () => {
      subscription = client.subscribe(destination, (frame) => {
        try {
          handler.current(JSON.parse(frame.body) as T);
        } catch {
          // ignore malformed frames
        }
      });
    };
    client.activate();

    return () => {
      subscription?.unsubscribe();
      void client.deactivate();
    };
  }, [destination, enabled]);
}
