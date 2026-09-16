// Lightweight native WebSocket / STOMP client for real-time schedule updates
// The WS origin is derived from the same VITE_API_URL env var used for REST,
// so https backends automatically get a wss:// socket in production.
import { WS_ORIGIN } from "./client.js";

export function subscribeToMaintenanceUpdates(onMessage) {
  const wsUrl = `${WS_ORIGIN}/ws/websocket`;
  let socket = null;
  let isConnected = false;

  function connect() {
    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        // Send STOMP CONNECT frame
        const connectFrame = "CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\0";
        socket.send(connectFrame);
      };

      socket.onmessage = (event) => {
        const data = event.data;
        if (data.startsWith("CONNECTED")) {
          isConnected = true;
          // Subscribe to /topic/maintenance-updates
          const subFrame = "SUBSCRIBE\nid:sub-0\ndestination:/topic/maintenance-updates\n\n\0";
          socket.send(subFrame);
        } else if (data.startsWith("MESSAGE")) {
          // Extract JSON body
          const bodyIndex = data.indexOf("\n\n");
          if (bodyIndex !== -1) {
            const rawBody = data.substring(bodyIndex + 2).replace(/\0$/, "").trim();
            try {
              const parsed = JSON.parse(rawBody);
              onMessage(parsed);
            } catch (e) {
              console.warn("Failed to parse WebSocket STOMP message body:", e);
            }
          }
        }
      };

      socket.onerror = (err) => {
        console.warn("WebSocket connection error:", err);
      };

      socket.onclose = () => {
        isConnected = false;
        // Attempt reconnect after 5 seconds
        setTimeout(connect, 5000);
      };
    } catch (e) {
      console.warn("Could not initiate WebSocket connection:", e);
    }
  }

  connect();

  return () => {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      socket.close();
    }
  };
}
