import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// SectionHeader — bold section title + optional muted subtitle, with an
// optional right-aligned "View All →" link. Pass `to` for a router link, or
// `onAction` for a button. `action` slot overrides both for custom content.
export default function SectionHeader({
  title,
  subtitle,
  to,
  onAction,
  actionLabel = "View All",
  action,
  className = "",
}) {
  let right = action;
  if (!right && (to || onAction)) {
    const inner = (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:gap-1.5">
        {actionLabel}
        <ArrowRight size={15} strokeWidth={2} />
      </span>
    );
    right = to ? (
      <Link to={to}>{inner}</Link>
    ) : (
      <button type="button" onClick={onAction}>
        {inner}
      </button>
    );
  }
  return (
    <div
      className={`mb-4 flex items-end justify-between gap-4 ${className}`}
    >
      <div>
        <h2 className="text-xl font-bold text-secondary">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-neutral-600">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
