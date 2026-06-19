import { useNavigate } from "react-router-dom";
import { Menu, Search, LogOut } from "lucide-react";
import NotificationBell from "../NotificationBell";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../lib/constants";

// White content-area top bar: mobile hamburger + brand on small screens,
// search button + notification bell + account on the right.
export default function TopBar({ onMenuClick }) {
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-neutral-600 transition hover:bg-blush-soft hover:text-secondary lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          className="rounded-lg p-2 text-neutral-600 transition hover:bg-blush-soft hover:text-secondary"
          aria-label="Search"
        >
          <Search size={20} strokeWidth={1.8} />
        </button>
        <NotificationBell />
        <div className="ml-1 hidden items-center gap-3 border-l border-neutral-200 pl-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight text-secondary">
              {displayName}
            </p>
            <p className="text-xs text-neutral-600">
              {ROLE_LABELS[user?.role] || ""}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {initial}
          </div>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Sign out"
          className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-blush-soft hover:text-secondary"
        >
          <LogOut size={16} strokeWidth={1.8} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
