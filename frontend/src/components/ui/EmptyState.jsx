import { Inbox } from "lucide-react";

// EmptyState — on-brand placeholder with a REQUIRED action slot.
// Every empty state must offer the user something to do (a button or link),
// never just "check back soon".
//
// Props:
//   icon         lucide component (default Inbox)
//   title        short bold headline
//   description  supporting copy (also accepts legacy `message` prop)
//   action       REQUIRED — a <Button>, <Link> or similar node
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  message, // legacy alias used by existing pages
  action,
  className = "",
}) {
  const body = description || message;
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 py-14 text-center ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-hairline bg-white text-primary">
        <Icon size={26} strokeWidth={1.7} aria-hidden="true" />
      </div>
      <p className="font-display text-base font-semibold tracking-tight text-ink">
        {title}
      </p>
      {body && <p className="max-w-sm text-sm text-neutral-600">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
