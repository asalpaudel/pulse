import Card from "./ui/Card";
import StatusPill, { UrgencyPill } from "./ui/StatusPill";
import { bloodGroupLabel, formatDateTime } from "../lib/constants";

// Compact card for a BloodRequest used across donor / bloodbank / hospital views.
export default function RequestCard({ request, children }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-pulse/10">
            <span className="text-base font-bold leading-none text-pulse">
              {bloodGroupLabel(request.bloodGroup)}
            </span>
            <span className="mt-0.5 text-[10px] text-pulse/70">
              {request.units} u
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <UrgencyPill urgency={request.urgency} />
              <StatusPill status={request.status} />
            </div>
            <p className="mt-1 text-xs text-stone-400">
              Posted {formatDateTime(request.createdAt)}
            </p>
          </div>
        </div>
      </div>
      {request.note && (
        <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600">
          {request.note}
        </p>
      )}
      {(request.latitude != null || request.address) && (
        <p className="mt-2 text-xs text-stone-400">
          {request.address ||
            `${request.latitude?.toFixed?.(4)}, ${request.longitude?.toFixed?.(4)}`}
        </p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </Card>
  );
}
