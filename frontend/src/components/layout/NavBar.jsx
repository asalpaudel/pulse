import { useNavigate } from "react-router-dom";
import Logo from "../Logo";
import NotificationBell from "../NotificationBell";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../lib/constants";

export default function NavBar({ onMenuClick }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName =
    profile?.fullName || profile?.name || user?.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/90 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Logo withText />
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <div className="hidden items-center gap-3 border-l border-stone-200 pl-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight text-stone-900">
              {displayName}
            </p>
            <p className="text-xs text-stone-400">
              {ROLE_LABELS[user?.role] || ""}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pulse text-sm font-semibold text-white">
            {initial}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-pulse"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
