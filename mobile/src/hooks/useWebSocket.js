import { useEffect, useLayoutEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { API_BASE } from "../config";

/**
 * Connects to the Pulse STOMP WebSocket and subscribes to the personal
 * alert channel `/topic/alerts/{userId}`. Each payload is a Notification
 * object (see API_CONTRACT.md).
 *
 * React Native has no DOM, so SockJS (used by the web app) is not available.
 * The Spring endpoint is registered `.withSockJS()`, which still exposes a
 * raw WebSocket transport at `/ws/websocket` — we connect STOMP directly to
 * that over the native global WebSocket. If the handshake is refused (e.g.
 * Origin checks), NotificationsContext falls back to interval polling.
 */
export function useWebSocket(userId, token, onMessage) {
  const handlerRef = useRef(onMessage);
  useLayoutEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId || !token) return undefined;

    const wsBase = API_BASE.replace(/^http/i, "ws");
    const client = new Client({
      brokerURL: `${wsBase}/ws/websocket`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      // SockJS raw-transport compatibility for non-browser STOMP clients.
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/alerts/${userId}`, (frame) => {
        try {
          handlerRef.current?.(JSON.parse(frame.body));
        } catch {
          // Ignore malformed frames.
        }
      });
    };

    // Swallow errors — backend may be offline or refuse the raw handshake.
    client.onStompError = () => {};
    client.onWebSocketError = () => {};

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [userId, token]);
}
