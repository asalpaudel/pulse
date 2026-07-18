import { useEffect, useLayoutEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE } from "../api/client";

/**
 * Subscribe to an arbitrary STOMP topic (e.g. `/topic/chat/{userId}` or
 * `/topic/ad-review/{adId}`). Each JSON frame body is passed to `onMessage`.
 * Pass a falsy `topic` to stay disconnected.
 *
 * @param {string|null} topic     full destination, e.g. "/topic/chat/12"
 * @param {(payload: object) => void} onMessage
 */
export function useTopic(topic, onMessage) {
  const handlerRef = useRef(onMessage);
  useLayoutEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!topic) return undefined;
    const token = localStorage.getItem("pulse_token");

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    client.onConnect = () => {
      client.subscribe(topic, (frame) => {
        try {
          handlerRef.current?.(JSON.parse(frame.body));
        } catch {
          // Ignore malformed frames.
        }
      });
    };
    client.onStompError = () => {};
    client.onWebSocketError = () => {};
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [topic]);
}
