import { Link } from "react-router-dom";
import Logo from "./Logo";

// Two-pane shell shared by Login and Register.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand pane */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-pulse-dark p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-pulse/40 to-transparent" />
        <Link to="/" className="relative">
          <Logo withText className="h-8 w-8 text-white" />
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">
            Get blood where it's needed, faster.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Pulse connects donors, hospitals, blood banks and emergency
            responders in one centralized real-time system.
          </p>
        </div>
        <p className="relative text-sm text-white/50">
          Real-time alerts · Donor matching · Live inventory
        </p>
      </div>

      {/* Form pane */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/">
              <Logo withText />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-stone-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
