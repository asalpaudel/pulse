import { CalendarDays, MapPin } from "lucide-react";
import Card from "./ui/Card";
import { formatDateTime } from "../lib/constants";

// Card for a DonationEvent. `children` slot for actions (join / manage).
export default function EventCard({ event, children }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tertiary-50 text-tertiary">
          <CalendarDays size={20} strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-secondary">{event.title}</h3>
          <p className="text-xs text-neutral-400">
            {formatDateTime(event.eventDate)}
          </p>
        </div>
      </div>
      {event.description && (
        <p className="mt-3 text-sm text-neutral-600">{event.description}</p>
      )}
      {event.address && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
          <MapPin size={14} strokeWidth={1.8} />
          {event.address}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}
