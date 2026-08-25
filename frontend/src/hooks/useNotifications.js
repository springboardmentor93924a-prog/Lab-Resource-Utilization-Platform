import { useState, useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/*
 * Central real-time notification hook. Connects once over WebSocket
 * (STOMP over SockJS), subscribes to this user's private queue, and
 * keeps a live list + unread count in sync — no polling interval
 * anywhere in this file.
 */
export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  const token = sessionStorage.getItem("token");

  const fetchInitial = useCallback(() => {
    // EDGE CASE: no token (logged out) — don't even try
    if (!token) return;

    fetch("http://localhost:8080/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load notifications");
        return res.json();
      })
      .then((data) => setNotifications(data))
      .catch(() => {
        // EDGE CASE: initial fetch failed (server down, etc.) — leave
        // the list empty rather than crashing; WebSocket push will
        // still populate new items as they arrive.
      });
  }, [token]);

  useEffect(() => {
    // EDGE CASE: no token — don't attempt a connection at all
    if (!token) return;

    fetchInitial();

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8080/ws?token=${encodeURIComponent(token)}`),
      reconnectDelay: 5000, // EDGE CASE: connection drops — auto-retry every 5s
      onConnect: () => {
        setConnected(true);
        client.subscribe("/user/queue/notifications", (message) => {
          try {
            const notification = JSON.parse(message.body);
            setNotifications((prev) => [notification, ...prev]);
          } catch {
            // EDGE CASE: malformed push payload — ignore rather than crash the UI
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [token, fetchInitial]);

  const markAsRead = useCallback(
    (id) => {
      // Optimistic update — flip locally immediately, don't wait on the network
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );

      fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {
        // EDGE CASE: request failed — the row will still show read locally
        // until next refetch; acceptable for a non-critical UI action.
      });
    },
    [token]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, connected, markAsRead };
}