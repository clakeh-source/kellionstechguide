import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, FlaskConical, FileQuestion,
  StickyNote, TrendingUp, Wrench, Settings, User, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/layout/TopNav";

const items = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/tracks", label: "My tracks", icon: GraduationCap },
  { to: "/app/labs", label: "Labs", icon: FlaskConical },
  { to: "/app/exams", label: "Practice exams", icon: FileQuestion },
  { to: "/app/notes", label: "Notes", icon: StickyNote },
  { to: "/app/progress", label: "Progress", icon: TrendingUp },
  { to: "/app/tools", label: "Tools", icon: Wrench },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <div className="flex flex-1">
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-sidebar">
          <div className="p-4">
            <Link to="/app/dashboard" className="flex items-center gap-2 font-display text-sm font-semibold">
              <Flame className="h-4 w-4 text-primary" /> Workspace
            </Link>
          </div>
          <nav className="flex-1 space-y-0.5 p-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
