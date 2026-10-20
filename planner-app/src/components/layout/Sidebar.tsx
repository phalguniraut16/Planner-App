import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Activity,
  GraduationCap,
  Target,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Day", href: "/my-day", icon: Calendar },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Habits", href: "/habits", icon: Activity },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Study Planner", href: "/study", icon: GraduationCap },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Projects", href: "/projects", icon: FileText },
  { label: "Finance", href: "/finance", icon: DollarSign },
  { label: "Notes", href: "/notes", icon: FileText },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ user, onLogout, onClose }: { user: any; onLogout: () => void; onClose: () => void }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-input">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">M</span>
        </div>
        <span className="font-semibold text-lg tracking-tight">MyLife Planner</span>
      </div>

      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
              `}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-input">
        <button
          className="flex items-center gap-2 w-full rounded-lg hover:bg-accent transition-colors px-3 py-2 text-left text-sm text-muted-foreground"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
        <button
          className="mt-2 w-full flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
          onClick={onClose}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Collapse</span>
        </button>
      </div>
    </div>
  );
}
