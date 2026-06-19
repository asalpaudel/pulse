import { Plus } from "lucide-react";

// HeroCard — the welcome banner at the top of every overview page.
// Bold greeting, a row of small meta chips, a faint medical-cross watermark,
// and an optional action slot on the right.
//
// Props:
//  - greeting : bold headline, e.g. "Welcome back, Sarah"
//  - subtitle : supporting line under the greeting
//  - chips    : array of { icon?, label } rendered as small meta pills
//  - action   : optional right-aligned node (e.g. a Button)
export default function HeroCard({ greeting, subtitle, chips = [], action }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-blush-card to-blush-soft p-6 shadow-sm">
      {/* faint medical-cross watermark */}
      <Plus
        size={180}
        strokeWidth={1}
        className="pointer-events-none absolute -right-8 -top-10 text-primary/5"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary">
            {greeting}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
          )}
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip, i) => {
                const Icon = chip.icon;
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-xs font-semibold text-secondary"
                  >
                    {Icon && (
                      <Icon size={13} strokeWidth={1.9} className="text-primary" />
                    )}
                    {chip.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
