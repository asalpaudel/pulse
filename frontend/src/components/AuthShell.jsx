import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Logo from "./Logo";

const HIGHLIGHTS = [
  "Real-time emergency alerts",
  "Smart donor matching by group & distance",
  "Live blood-bank inventory",
];

// Two-pane shell shared by Login and Register.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand pane — editorial, matches the Pulse landing aesthetic */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-secondary-800 p-12 text-white lg:flex">
        {/* layered washes for depth */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary-700 via-secondary-800 to-secondary-900" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_85%_15%,rgba(217,45,32,0.32)_0%,transparent_55%)]" />
        {/* fine dotted texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.10] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:22px_22px]" />
        {/* faint medical-cross watermark */}
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute -bottom-16 -left-10 h-72 w-72 text-white/[0.04]"
          fill="currentColor"
        >
          <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" />
        </svg>

        <Link to="/" className="relative z-10">
          <Logo withText textClassName="text-white" />
        </Link>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live blood network
          </span>
          <h2 className="mt-6 text-[2.5rem] font-bold leading-[1.05] tracking-tight text-white">
            Get blood where it's
            <br />
            needed, faster.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-secondary-100">
            Pulse connects donors, hospitals, blood banks and emergency
            responders in one centralized real-time system.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary-200">
                  <Check size={14} strokeWidth={2.4} />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs uppercase tracking-[0.18em] text-secondary-200/70">
          Real-time alerts · Donor matching · Live inventory
        </p>
      </div>

      {/* Form pane */}
      <div className="flex w-full items-center justify-center bg-blush-page px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/">
              <Logo withText />
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-secondary">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-6 text-sm text-neutral-600">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}
