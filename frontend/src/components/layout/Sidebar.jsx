import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TriangleAlert,
  Droplet,
  CalendarDays,
  Clock,
  User,
  Search,
  Landmark,
  ShieldCheck,
  Users,
  Boxes,
  MessageSquare,
  Settings,
} from "lucide-react";
import Logo from "../Logo";
import { ROLE_LABELS } from "../../lib/constants";

// Role-aware navigation items. Each entry: { to, label, icon }.
// `icon` is a lucide-react component.
const NAV = {
  DONOR: [
    { to: "/donor", label: "Overview", icon: LayoutDashboard },
    { to: "/donor/alerts", label: "Emergency Alerts", icon: TriangleAlert },
    { to: "/donor/requests", label: "Blood Requests", icon: Droplet },
    { to: "/donor/events", label: "Donation Events", icon: CalendarDays },
    { to: "/donor/history", label: "Donation History", icon: Clock },
  ],
  HOSPITAL: [
    { to: "/hospital", label: "Overview", icon: LayoutDashboard },
    { to: "/donor/messages", label: "Messages", icon: MessageSquare },
    { to: "/hospital/requests", label: "My Requests", icon: Droplet },
    { to: "/hospital/donors", label: "Find Donors", icon: Search },
    { to: "/hospital/bloodbanks", label: "Find Blood Banks", icon: Landmark },
  ],
  BLOOD_BANK: [
    { to: "/bloodbank", label: "Overview", icon: LayoutDashboard },
    { to: "/bloodbank/stock", label: "Blood Stock", icon: Boxes },
    { to: "/hospital/messages", label: "Messages", icon: MessageSquare },
    { to: "/bloodbank/requests", label: "Open Requests", icon: TriangleAlert },
    { to: "/bloodbank/events", label: "Donation Events", icon: CalendarDays },
  ],
  ADMIN: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/verify", label: "Verifications", icon: ShieldCheck },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/bloodbank/messages", label: "Messages", icon: MessageSquare },
  ],
  SUPER_ADMIN: [
    { to: "/superadmin", label: "Security overview", icon: LayoutDashboard },
    { to: "/superadmin/security", label: "Two-factor security", icon: ShieldCheck },
  ],
};

// Profile / Settings links pinned to the bottom of the sidebar, per role.
// Settings has no dedicated route in the app yet — it points at the profile page
// so the link is never dead.
const FOOTER_NAV = {
  DONOR: { profile: "/donor/profile" },
  HOSPITAL: { profile: "/hospital/profile" },
  BLOOD_BANK: { profile: "/bloodbank/profile" },
  ADMIN: { profile: "/admin" },
  SUPER_ADMIN: { profile: "/superadmin/security" },
};

const ROLE_SUBTITLE = {
  DONOR: "Donor Portal",
  HOSPITAL: "Hospital Portal",
  BLOOD_BANK: "Blood Bank Portal",
  ADMIN: "Admin Portal",
  SUPER_ADMIN: "Owner Security",
};

function navItemClass({ isActive }) {
  return [
    "flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm font-medium transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-blush-card",
    isActive
      ? "border-primary bg-white text-primary shadow-sm"
      : "border-transparent text-neutral-600 hover:bg-blush-soft",
  ].join(" ");
}

function NavRow({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink to={to} end={end} onClick={onNavigate} className={navItemClass}>
      <Icon size={19} strokeWidth={1.8} className="shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ role, open, onNavigate }) {
  const items = NAV[role] || [];
  const footer = FOOTER_NAV[role] || {};

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-blush-card transition-transform duration-200 lg:static lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand */}
      <div className="px-5 py-5">
        <Logo withText subtitle={ROLE_SUBTITLE[role] || ROLE_LABELS[role]} />
      </div>

      {/* Primary nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => (
          <NavRow
            key={item.to}
            {...item}
            end={item.to.split("/").length === 2}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Pinned footer — Profile + Settings */}
      <div className="space-y-1 border-t border-neutral-200 px-3 py-3">
        {footer.profile && (
          <NavRow
            to={footer.profile}
            label="Profile"
            icon={User}
            onNavigate={onNavigate}
          />
        )}
        <NavRow
          to={footer.profile || "#"}
          label="Settings"
          icon={Settings}
          onNavigate={onNavigate}
        />
      </div>
    </aside>
  );
}
