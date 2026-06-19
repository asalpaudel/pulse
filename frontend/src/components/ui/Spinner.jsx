import { Inbox } from "lucide-react";

export default function Spinner({ label = "Loading…", className = "" }) {
  return (
    <div
      role="status"
      aria-label={label || "Loading"}
      className={`flex flex-col items-center justify-center gap-3 py-12 text-neutral-600 ${className}`}
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary motion-reduce:[animation-duration:1.5s]" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

// EmptyState — on-brand placeholder. Pass an optional lucide `icon` component.
export function EmptyState({ title, message, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blush-card text-primary">
        <Icon size={24} strokeWidth={1.6} />
      </div>
      <p className="text-sm font-semibold text-secondary">{title}</p>
      {message && (
        <p className="max-w-sm text-sm text-neutral-600">{message}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
