import PageHeader from "../../components/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Spinner";
import { useNotifications } from "../../context/NotificationsContext";
import { formatDateTime } from "../../lib/constants";

export default function DonorAlerts() {
  const { notifications, unreadCount, markRead, markAllRead, loading } =
    useNotifications();

  return (
    <div>
      <PageHeader
        title="Emergency Alerts"
        subtitle="Live alerts matched to your blood group and location"
        action={
          unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              Mark all read ({unreadCount})
            </Button>
          )
        }
      />

      <Card>
        {notifications.length === 0 ? (
          <EmptyState
            title={loading ? "Loading alerts…" : "No alerts yet"}
            message="Emergency requests matching your profile will appear here in real time."
          />
        ) : (
          <ul className="divide-y divide-stone-100">
            {notifications.map((n) => {
              const isEmergency = (n.type || "")
                .toUpperCase()
                .includes("EMERGENCY");
              return (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 px-5 py-4 ${
                    n.read ? "" : "bg-pulse/5"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      isEmergency ? "bg-pulse" : "bg-sky-400"
                    } ${!n.read && isEmergency ? "animate-pulse" : ""}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-stone-800">{n.message}</p>
                    <p className="mt-1 text-xs text-stone-400">
                      {n.type ? `${n.type} · ` : ""}
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="shrink-0 text-xs font-medium text-pulse hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
