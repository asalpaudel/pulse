import { useEffect, useLayoutEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE } from "../api/client";

/**
 * Connects to the Pulse STOMP WebSocket and subscribes to the personal
 * alert channel `/topic/alerts/{userId}`. Each message payload is a
 * Notification object (see API_CONTRACT.md).
 *
 * @param {string|number} userId       current user id
 * @param {string} token               JWT (sent as STOMP header + query)
 * @param {(notification: object) => void} onMessage
 */
export function useWebSocket(userId, token, onMessage) {
  const handlerRef = useRef(onMessage);
  // Keep the latest handler without re-subscribing the socket.
  useLayoutEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId || !token) return undefined;

    const client = new Client({
      // SockJS factory — the backend exposes /ws.
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/alerts/${userId}`, (frame) => {
        try {
          const payload = JSON.parse(frame.body);
          handlerRef.current?.(payload);
        } catch {
          // Ignore malformed frames.
        }
      });
    };

    // Swallow errors — backend may be offline during development.
    client.onStompError = () => {};
    client.onWebSocketError = () => {};

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userId, token]);
}
