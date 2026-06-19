// Shared enums — must match API_CONTRACT.md exactly. Ported from the web app.

export const ROLES = {
  DONOR: "DONOR",
  HOSPITAL: "HOSPITAL",
  BLOOD_BANK: "BLOOD_BANK",
  ADMIN: "ADMIN",
};

export const ROLE_LABELS = {
  DONOR: "Donor",
  HOSPITAL: "Hospital",
  BLOOD_BANK: "Blood Bank",
  ADMIN: "Administrator",
};

export const BLOOD_GROUPS = [
  "A_POS",
  "A_NEG",
  "B_POS",
  "B_NEG",
  "AB_POS",
  "AB_NEG",
  "O_POS",
  "O_NEG",
];

// Human-friendly label e.g. A_POS -> "A+"
export const bloodGroupLabel = (bg) => {
  if (!bg) return "—";
  const [letter, sign] = bg.split("_");
  return `${letter}${sign === "POS" ? "+" : "-"}`;
};

export const URGENCY = {
  EMERGENCY: "EMERGENCY",
  ROUTINE: "ROUTINE",
};

export const REQUEST_STATUSES = ["OPEN", "MATCHED", "FULFILLED", "CLOSED"];
export const STATUS_ORDER = ["OPEN", "MATCHED", "FULFILLED", "CLOSED"];

export const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Relative "time ago" — small helper handy for notification/request feeds.
export const timeAgo = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
};

// Default map center — Kathmandu, Nepal.
export const DEFAULT_COORDS = { latitude: 27.7172, longitude: 85.324 };
