import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as notificationsApi from "../api/notifications";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { useWebSocket } from "../hooks/useWebSocket";

const NotificationsContext = createContext(null);

// Fallback polling cadence — covers the case where the raw WS handshake is
// refused on a device, so emergency alerts still arrive (slightly delayed).
const POLL_MS = 20000;

export function NotificationsProvider({ children }) {
  const { isAuthenticated, user, token } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const seenIds = useRef(new Set());

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await notificationsApi.listNotifications();
      const list = Array.isArray(data) ? data : [];
      list.forEach((n) => seenIds.current.add(n.id));
      setNotifications(list);
    } catch {
      // Backend may be offline; keep whatever we have.
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    } else {
      setNotifications([]);
      seenIds.current = new Set();
    }
  }, [isAuthenticated, load]);

  // Interval polling fallback for live alerts.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [isAuthenticated, load]);

  const handleIncoming = useCallback(
    (notification) => {
      if (!notification) return;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      // Only toast notifications we haven't surfaced before.
      if (!seenIds.current.has(notification.id)) {
        seenIds.current.add(notification.id);
        const isEmergency = (notification.type || "")
          .toUpperCase()
          .includes("EMERGENCY");
        const fire = isEmergency ? toast.alert : toast.info;
        fire(notification.message || "New alert", "Pulse Alert");
      }
    },
    [toast],
  );

  useWebSocket(user?.id, token, handleIncoming);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    try {
      await notificationsApi.markNotificationRead(id);
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
      );
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await Promise.allSettled(
      unread.map((n) => notificationsApi.markNotificationRead(n.id)),
    );
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        load,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationsProvider",
    );
  return ctx;
}
