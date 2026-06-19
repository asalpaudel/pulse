import { TriangleAlert, Info, BellRing } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
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

      <Card className="overflow-hidden">
        {notifications.length === 0 ? (
          <EmptyState
            icon={BellRing}
            title={loading ? "Loading alerts…" : "No alerts yet"}
            message="Emergency requests matching your profile will appear here in real time."
          />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {notifications.map((n) => {
              const isEmergency = (n.type || "")
                .toUpperCase()
                .includes("EMERGENCY");
              const Icon = isEmergency ? TriangleAlert : Info;
              return (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 px-5 py-4 transition ${
                    n.read ? "" : "bg-primary/5"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isEmergency
                        ? "bg-primary-50 text-primary"
                        : "bg-tertiary-50 text-tertiary"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-secondary">
                        {n.message}
                      </p>
                      {!n.read && (
                        <Badge tone={isEmergency ? "red" : "blue"}>NEW</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">
                      {n.type ? `${n.type} · ` : ""}
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="shrink-0 text-xs font-semibold text-primary hover:underline"
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
