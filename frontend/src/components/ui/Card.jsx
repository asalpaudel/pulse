// Base surface — white, rounded-2xl, neutral border, soft shadow.
// Padding is intentionally NOT baked in: callers add `p-5` / `p-6` (or use
// CardHeader/CardBody) so the component composes cleanly.
export default function Card({ className = "", children, ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div
      className={`flex items-start justify-between gap-4 border-b border-neutral-100 px-6 py-4 ${className}`}
    >
      <div>
        <h3 className="text-base font-bold text-secondary">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-neutral-600">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}
