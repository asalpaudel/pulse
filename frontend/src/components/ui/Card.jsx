export default function Card({ className = "", children, ...rest }) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div
      className={`flex items-start justify-between gap-4 border-b border-stone-100 px-5 py-4 ${className}`}
    >
      <div>
        <h3 className="text-base font-semibold text-stone-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
