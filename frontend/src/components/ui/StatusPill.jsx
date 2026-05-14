import Badge from "./Badge";

// Maps BloodRequest lifecycle status -> badge tone.
const STATUS_TONE = {
  OPEN: "amber",
  MATCHED: "blue",
  FULFILLED: "green",
  CLOSED: "slate",
};

export default function StatusPill({ status }) {
  const tone = STATUS_TONE[status] || "neutral";
  return <Badge tone={tone}>{status || "—"}</Badge>;
}

// Urgency pill — EMERGENCY is loud, ROUTINE is quiet.
export function UrgencyPill({ urgency }) {
  if (urgency === "EMERGENCY") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-pulse px-2.5 py-0.5 text-xs font-semibold text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        EMERGENCY
      </span>
    );
  }
  return <Badge tone="neutral">ROUTINE</Badge>;
}

export function VerifiedPill({ verified }) {
  return verified ? (
    <Badge tone="green">Verified</Badge>
  ) : (
    <Badge tone="amber">Pending</Badge>
  );
}
