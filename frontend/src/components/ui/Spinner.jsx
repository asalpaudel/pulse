export default function Spinner({ label = "Loading…", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-stone-400 ${className}`}
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-pulse/30 border-t-pulse" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
        <svg
          className="h-6 w-6 text-stone-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-stone-700">{title}</p>
      {message && <p className="max-w-sm text-sm text-stone-400">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
