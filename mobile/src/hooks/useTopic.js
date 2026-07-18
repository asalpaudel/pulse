import { useEffect, useLayoutEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { API_BASE } from "../config";

export function useTopic(topic, token, onMessage) {
  const handlerRef = useRef(onMessage);

  useLayoutEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!topic || !token) return undefined;
    const client = new Client({
      brokerURL: `${API_BASE.replace(/^http/i, "ws")}/ws/websocket`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
    });
    client.onConnect = () => {
      client.subscribe(topic, (frame) => {
        try {
          handlerRef.current?.(JSON.parse(frame.body));
        } catch {
          // Ignore malformed frames and keep the subscription alive.
        }
      });
    };
    client.onStompError = () => {};
    client.onWebSocketError = () => {};
    client.activate();
    return () => client.deactivate();
  }, [topic, token]);
}
