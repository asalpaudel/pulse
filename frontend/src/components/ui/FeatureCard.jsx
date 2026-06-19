import { Check } from "lucide-react";

// FeatureCard — dark navy highlight card for marketing-style content inside
// dashboards (e.g. "Your Safety Matters"). Optional `bullets` render as rows
// with small green check icons. `children` is a free slot below the bullets.
export default function FeatureCard({
  title,
  description,
  bullets,
  icon: Icon,
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-secondary-900 to-secondary-800 p-6 text-white shadow-sm ${className}`}
    >
      {Icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
          <Icon size={22} strokeWidth={1.8} />
        </div>
      )}
      {title && <h3 className="text-lg font-bold">{title}</h3>}
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-secondary-100">
          {description}
        </p>
      )}
      {bullets?.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                <Check size={11} strokeWidth={2.5} />
              </span>
              <span className="text-secondary-100">{b}</span>
            </li>
          ))}
        </ul>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
