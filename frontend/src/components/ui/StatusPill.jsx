import { TriangleAlert } from "lucide-react";
import Badge from "./Badge";

// Generic label → tone mapping per the design spec.
// Covers request lifecycle, urgency, verification and response states.
const TONE_BY_LABEL = {
  // red — urgent / emergency
  URGENT: "red",
  EMERGENCY: "red",
  // amber — warning / pending / open
  OPEN: "amber",
  PENDING: "amber",
  WARNING: "amber",
  "HIGH PRIORITY": "amber",
  // blue — active / matched / info
  MATCHED: "blue",
  ACTIVE: "blue",
  INFO: "blue",
  ROUTINE: "blue",
  OFFERED: "blue",
  // green — eligible / verified / fulfilled / success
  FULFILLED: "green",
  ELIGIBLE: "green",
  VERIFIED: "green",
  ACCEPTED: "green",
  SUCCESS: "green",
  AVAILABLE: "green",
  // neutral — closed / inactive
  CLOSED: "neutral",
  INACTIVE: "neutral",
  UNAVAILABLE: "neutral",
};

function toneForStatus(value) {
  if (!value) return "neutral";
  return TONE_BY_LABEL[String(value).toUpperCase()] || "neutral";
}

// StatusPill — pass a `status` (BloodRequest lifecycle or any labelled state).
export default function StatusPill({ status, icon, className = "" }) {
  return (
    <Badge tone={toneForStatus(status)} icon={icon} className={className}>
      {status || "—"}
    </Badge>
  );
}

// PriorityPill — emphasises urgency. EMERGENCY renders solid red and loud.
export function PriorityPill({ priority, urgency, className = "" }) {
  const value = priority || urgency;
  if (String(value).toUpperCase() === "EMERGENCY") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white ${className}`}
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
        EMERGENCY
      </span>
    );
  }
  if (String(value).toUpperCase() === "URGENT") {
    return (
      <Badge tone="red" icon={TriangleAlert} className={className}>
        URGENT
      </Badge>
    );
  }
  return (
    <Badge tone={toneForStatus(value)} className={className}>
      {value || "ROUTINE"}
    </Badge>
  );
}

// Back-compat alias — existing pages import `UrgencyPill`.
export function UrgencyPill({ urgency }) {
  return <PriorityPill urgency={urgency} />;
}

export function VerifiedPill({ verified }) {
  return verified ? (
    <Badge tone="green">Verified</Badge>
  ) : (
    <Badge tone="amber">Pending</Badge>
  );
}
