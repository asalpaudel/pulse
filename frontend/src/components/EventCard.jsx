import Card from "./ui/Card";
import { formatDateTime } from "../lib/constants";

// Card for a DonationEvent. `children` slot for actions (join / manage).
export default function EventCard({ event, children }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-900">{event.title}</h3>
          <p className="text-xs text-stone-400">
            {formatDateTime(event.eventDate)}
          </p>
        </div>
      </div>
      {event.description && (
        <p className="mt-3 text-sm text-stone-600">{event.description}</p>
      )}
      {event.address && (
        <p className="mt-2 text-xs text-stone-400">{event.address}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}
