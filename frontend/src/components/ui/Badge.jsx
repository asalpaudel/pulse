// Small rounded-full pill. `tone` follows the design-spec color mapping.
const TONES = {
  neutral: "bg-neutral-100 text-neutral-600",
  red: "bg-primary-50 text-primary-700",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-tertiary-50 text-tertiary-700",
  slate: "bg-neutral-100 text-neutral-600",
  // Strong solid red — for the loudest emphasis (e.g. EMERGENCY).
  solidRed: "bg-primary text-white",
};

export default function Badge({
  tone = "neutral",
  icon: Icon,
  className = "",
  children,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone] || TONES.neutral} ${className}`}
    >
      {Icon && <Icon size={12} strokeWidth={2} />}
      {children}
    </span>
  );
}
