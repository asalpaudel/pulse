import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import * as notificationsApi from "../api/notifications";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { useWebSocket } from "../hooks/useWebSocket";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { isAuthenticated, user, token } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await notificationsApi.listNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // Backend may be offline; keep whatever we have.
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Defer to a microtask so we don't setState synchronously in the effect.
    Promise.resolve().then(() => {
      if (isAuthenticated) load();
      else setNotifications([]);
    });
  }, [isAuthenticated, load]);

  // Live alerts over STOMP WebSocket.
  const handleIncoming = useCallback(
    (notification) => {
      if (!notification) return;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      const isEmergency =
        (notification.type || "").toUpperCase().includes("EMERGENCY");
      const fire = isEmergency ? toast.alert : toast.info;
      fire(notification.message || "New alert", "Pulse Alert");
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
      // Revert on failure.
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
      value={{ notifications, unreadCount, loading, load, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
