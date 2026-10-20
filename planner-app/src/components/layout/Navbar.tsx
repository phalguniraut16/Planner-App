import { useState } from "react";
import { Menu, Bell, User } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";

export default function Navbar({ user, onLogout, onToggleSidebar }: { user: any; onLogout: () => void; onToggleSidebar: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email || "User";
  const initial = displayName[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-input bg-background/80 backdrop-blur-md px-4 py-2">
      <button className="md:hidden" onClick={onToggleSidebar}>
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 flex items-center justify-between">
        <span className="font-semibold tracking-tight text-lg">MyLife Planner</span>

        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => setNotifOpen((p) => !p)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border bg-card p-1 text-muted-foreground hover:bg-accent transition-colors">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {initial}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {displayName}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onSelect={onLogout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
