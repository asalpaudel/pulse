import { NavLink } from "react-router-dom";
import { ROLE_LABELS } from "../../lib/constants";

// Role-aware navigation items. Each entry: { to, label, icon }.
const NAV = {
  DONOR: [
    { to: "/donor", label: "Overview", icon: "home" },
    { to: "/donor/alerts", label: "Emergency Alerts", icon: "alert" },
    { to: "/donor/requests", label: "Blood Requests", icon: "drop" },
    { to: "/donor/events", label: "Donation Events", icon: "calendar" },
    { to: "/donor/history", label: "Donation History", icon: "clock" },
    { to: "/donor/profile", label: "My Profile", icon: "user" },
  ],
  HOSPITAL: [
    { to: "/hospital", label: "Overview", icon: "home" },
    { to: "/hospital/requests", label: "My Requests", icon: "drop" },
    { to: "/hospital/donors", label: "Find Donors", icon: "search" },
    { to: "/hospital/bloodbanks", label: "Find Blood Banks", icon: "bank" },
    { to: "/hospital/profile", label: "Hospital Profile", icon: "user" },
  ],
  BLOOD_BANK: [
    { to: "/bloodbank", label: "Overview", icon: "home" },
    { to: "/bloodbank/stock", label: "Blood Stock", icon: "drop" },
    { to: "/bloodbank/requests", label: "Open Requests", icon: "alert" },
    { to: "/bloodbank/events", label: "Donation Events", icon: "calendar" },
    { to: "/bloodbank/profile", label: "Blood Bank Profile", icon: "user" },
  ],
  ADMIN: [
    { to: "/admin", label: "Overview", icon: "home" },
    { to: "/admin/verify", label: "Verifications", icon: "check" },
    { to: "/admin/users", label: "Users", icon: "users" },
  ],
};

const ICONS = {
  home: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10",
  alert: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  drop: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",
  calendar: "M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  search: "M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z",
  bank: "M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  users: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-6.65",
};

function NavIcon({ name }) {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name]} />
    </svg>
  );
}

export default function Sidebar({ role, open, onNavigate }) {
  const items = NAV[role] || [];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-4 py-5">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          {ROLE_LABELS[role]}
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split("/").length === 2}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-pulse/10 text-pulse"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`
            }
          >
            <NavIcon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-stone-100 px-5 py-4">
        <p className="text-xs text-stone-400">
          Pulse — real-time blood coordination
        </p>
      </div>
    </aside>
  );
}
