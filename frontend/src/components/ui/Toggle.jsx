// Toggle — two-or-more option segmented control (e.g. "Map View / List View").
// `options`: [{ value, label, icon? }]. `value` + `onChange(value)` controlled.
export default function Toggle({ options = [], value, onChange, className = "" }) {
  return (
    <div
      className={`inline-flex gap-1 rounded-xl bg-blush-card p-1 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange?.(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
              active
                ? "bg-white text-secondary shadow-sm"
                : "text-tertiary hover:text-tertiary-700"
            }`}
          >
            {Icon && <Icon size={15} strokeWidth={1.9} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
