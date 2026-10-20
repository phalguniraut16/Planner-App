import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import DashboardShell from "../dashboard/Shell";

export default function Layout({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={onLogout} onToggleSidebar={() => setSidebarOpen((p) => !p)} />
      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-input
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:relative md:translate-x-0
          `}
        >
          <Sidebar user={user} onLogout={onLogout} onClose={() => setSidebarOpen(false)} />
        </aside>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 w-full overflow-y-auto bg-background p-4 md:p-6">
          <DashboardShell />
        </main>
      </div>
    </div>
  );
}
