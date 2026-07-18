// Shared enums — must match API_CONTRACT.md exactly.

export const ROLES = {
  DONOR: "DONOR",
  HOSPITAL: "HOSPITAL",
  BLOOD_BANK: "BLOOD_BANK",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
};

export const ROLE_LABELS = {
  DONOR: "Donor",
  HOSPITAL: "Hospital",
  BLOOD_BANK: "Blood Bank",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super Admin",
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

// Lifecycle ordering for status transitions.
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

// Default map center — Kathmandu, Nepal.
export const DEFAULT_COORDS = { latitude: 27.7172, longitude: 85.324 };
