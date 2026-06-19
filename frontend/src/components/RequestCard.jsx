import { MapPin, Droplet, Clock, ShieldCheck } from "lucide-react";
import Card from "./ui/Card";
import BloodGroupBadge from "./ui/BloodGroupBadge";
import StatusPill, { PriorityPill } from "./ui/StatusPill";
import { bloodGroupLabel, formatDateTime } from "../lib/constants";

/**
 * RequestCard — white card for a BloodRequest, used across donor / hospital /
 * bloodbank views.
 *
 * Props:
 *  - request    : BloodRequest (required) — { bloodGroup, units, urgency, status, note, latitude, longitude, createdAt }
 *  - requesterName : optional string shown as the bold title (falls back to a generic label)
 *  - distanceKm : optional number — renders a "Xkm away" meta row
 *  - verified   : optional bool   — renders a green "Verified Request" row
 *  - elevated   : optional bool   — visually lifts one card in a row
 *  - children   : footer slot for the action button(s)
 */
export default function RequestCard({
  request,
  requesterName,
  distanceKm,
  verified = false,
  elevated = false,
  children,
}) {
  const hasLocation = request.latitude != null || request.address;
  const locationLabel =
    request.address ||
    (request.latitude != null
      ? `${request.latitude?.toFixed?.(4)}, ${request.longitude?.toFixed?.(4)}`
      : null);

  return (
    <Card
      className={`flex flex-col p-5 ${
        elevated ? "shadow-md ring-1 ring-primary/10" : ""
      }`}
    >
      {/* Top row — blood group + priority/status */}
      <div className="flex items-start justify-between gap-3">
        <BloodGroupBadge group={request.bloodGroup} size="md" />
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <PriorityPill urgency={request.urgency} />
          <StatusPill status={request.status} />
        </div>
      </div>

      {/* Requester */}
      <p className="mt-3 font-bold text-secondary">
        {requesterName || `${bloodGroupLabel(request.bloodGroup)} blood request`}
      </p>
      <p className="text-xs text-neutral-400">
        Posted {formatDateTime(request.createdAt)}
      </p>

      {/* Meta rows */}
      <div className="mt-3 space-y-1.5 text-sm text-neutral-600">
        {distanceKm != null && (
          <p className="flex items-center gap-2">
            <MapPin size={16} strokeWidth={1.8} className="text-neutral-400" />
            {Number(distanceKm).toFixed(1)}km away
          </p>
        )}
        <p className="flex items-center gap-2">
          <Droplet size={16} strokeWidth={1.8} className="text-neutral-400" />
          {request.units} unit{request.units === 1 ? "" : "s"} required
        </p>
        {hasLocation && locationLabel && (
          <p className="flex items-center gap-2">
            <Clock size={16} strokeWidth={1.8} className="text-neutral-400" />
            {locationLabel}
          </p>
        )}
        {verified && (
          <p className="flex items-center gap-2 font-medium text-green-700">
            <ShieldCheck size={16} strokeWidth={1.9} />
            Verified Request
          </p>
        )}
      </div>

      {request.note && (
        <p className="mt-3 rounded-xl bg-blush-soft px-3 py-2 text-sm text-neutral-600">
          {request.note}
        </p>
      )}

      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}
