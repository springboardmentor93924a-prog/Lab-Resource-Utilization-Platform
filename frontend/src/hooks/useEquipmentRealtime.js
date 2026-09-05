import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/*
 * Subscribes to the backend's public "/topic/equipment-updates"
 * broadcast (see RealtimeUpdateService.pingEquipmentUpdated() —
 * fired on every booking create/approve/reject/complete and every
 * equipment create/update/delete, plus the 60s scheduler sweep).
 *
 * The backend intentionally sends a lightweight ping, not the
 * equipment payload itself (different roles/institutions see
 * different equipment subsets), so onUpdate should just re-fetch
 * whatever list the page already fetches on mount.
 *
 * This replaces fixed-interval polling (previously every 15s on the
 * Equipment page) with an instant push — the fetch now happens the
 * moment something actually changes, not up to 15s later.
 */
export default function useEquipmentRealtime(onUpdate) {
  const clientRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    // EDGE CASE: no token (logged out) — don't attempt a connection
    if (!token) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8080/ws?token=${encodeURIComponent(token)}`),
      reconnectDelay: 5000, // EDGE CASE: connection drops — auto-retry every 5s
      onConnect: () => {
        client.subscribe("/topic/equipment-updates", () => {
          // Payload is just a ping — re-fetch is the actual source of truth.
          onUpdateRef.current?.();
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);
}