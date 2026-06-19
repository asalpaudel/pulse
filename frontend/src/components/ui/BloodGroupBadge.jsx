import { bloodGroupLabel } from "../../lib/constants";

// BloodGroupBadge — circular badge showing a blood group (O+, A−, …).
// `variant`: "solid" (red fill, white text) or "outline" (red ring, red text).
// `size`: "sm" | "md" | "lg". Accepts either an enum value (O_POS) or a label.
const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-14 w-14 text-base",
};

export default function BloodGroupBadge({
  group,
  variant = "solid",
  size = "md",
  className = "",
}) {
  const label = group?.includes("_") ? bloodGroupLabel(group) : group || "—";
  const styles =
    variant === "outline"
      ? "border-2 border-primary text-primary bg-white"
      : "bg-primary text-white";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold leading-none ${SIZES[size] || SIZES.md} ${styles} ${className}`}
    >
      {label}
    </span>
  );
}
