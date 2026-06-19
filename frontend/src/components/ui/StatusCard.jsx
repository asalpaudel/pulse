import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

// StatusCard — soft-tinted card for a status state. `tone` drives the tint and
// default icon: green = good/eligible, amber = warning, blue = info, red = bad,
// neutral = inactive. Renders a bold status line, supporting text and an
// optional action slot (pass a Button via `action` or use `children`).
const TONES = {
  green: {
    wrap: "bg-green-50 border-green-200",
    icon: "text-green-600",
    title: "text-green-800",
    text: "text-green-700",
    Default: CheckCircle2,
  },
  amber: {
    wrap: "bg-amber-50 border-amber-200",
    icon: "text-amber-600",
    title: "text-amber-800",
    text: "text-amber-700",
    Default: AlertTriangle,
  },
  blue: {
    wrap: "bg-tertiary-50 border-tertiary-200",
    icon: "text-tertiary-600",
    title: "text-tertiary-800",
    text: "text-tertiary-700",
    Default: Info,
  },
  red: {
    wrap: "bg-primary-50 border-primary-200",
    icon: "text-primary-600",
    title: "text-primary-800",
    text: "text-primary-700",
    Default: XCircle,
  },
  neutral: {
    wrap: "bg-neutral-50 border-neutral-200",
    icon: "text-neutral-600",
    title: "text-neutral-800",
    text: "text-neutral-600",
    Default: Info,
  },
};

export default function StatusCard({
  tone = "green",
  icon,
  title,
  description,
  action,
  children,
  className = "",
}) {
  const t = TONES[tone] || TONES.green;
  const Icon = icon || t.Default;
  return (
    <div className={`rounded-2xl border p-5 ${t.wrap} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon size={22} strokeWidth={1.9} className={`mt-0.5 shrink-0 ${t.icon}`} />
        <div className="min-w-0 flex-1">
          {title && (
            <p className={`text-sm font-bold ${t.title}`}>{title}</p>
          )}
          {description && (
            <p className={`mt-1 text-sm ${t.text}`}>{description}</p>
          )}
          {(action || children) && (
            <div className="mt-3">{action || children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
