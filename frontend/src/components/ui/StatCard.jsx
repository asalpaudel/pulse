// StatCard — small white card for 4-up metric rows on overview pages.
// A colored icon in a soft tinted square (top-left), a muted label, a large value.
// Back-compat: works with just { label, value, hint, tone } (no icon).
const TONES = {
  neutral: { box: "bg-neutral-100 text-neutral-600", value: "text-secondary" },
  red: { box: "bg-primary-50 text-primary", value: "text-secondary" },
  green: { box: "bg-green-50 text-green-600", value: "text-secondary" },
  amber: { box: "bg-amber-50 text-amber-600", value: "text-secondary" },
  blue: { box: "bg-tertiary-50 text-tertiary", value: "text-secondary" },
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      {Icon && (
        <div
          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${t.box}`}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
      )}
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-600">
        {label}
      </p>
      <p className={`mt-1 text-3xl font-bold ${t.value}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
