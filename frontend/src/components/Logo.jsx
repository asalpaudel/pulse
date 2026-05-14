// Pulse mark — a heartbeat line inside a droplet.
export default function Logo({ className = "h-8 w-8", withText = false }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg className={className} viewBox="0 0 32 32" fill="none">
        <path
          d="M16 2C16 2 5 13.5 5 21a11 11 0 0022 0C27 13.5 16 2 16 2Z"
          fill="currentColor"
          className="text-pulse"
        />
        <path
          d="M9 21h3l2-4 3 8 2.5-5H24"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withText && (
        <span className="text-xl font-bold tracking-tight text-stone-900">
          Pulse
        </span>
      )}
    </span>
  );
}
