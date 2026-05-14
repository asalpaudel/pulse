import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout() {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50">
      <NavBar onMenuClick={() => setSidebarOpen((o) => !o)} />
      <div className="flex">
        <Sidebar
          role={role}
          open={sidebarOpen}
          onNavigate={() => setSidebarOpen(false)}
        />
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-stone-900/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
