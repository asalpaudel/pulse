import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

export default function DashboardLayout() {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-blush-soft">
      <Sidebar
        role={role}
        open={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-secondary-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-7xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
