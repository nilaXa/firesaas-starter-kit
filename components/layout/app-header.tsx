"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut, Building2 } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  // Generate breadcrumb title based on path
  const getPageTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    const first = parts[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-foreground tracking-tight hidden sm:block">
          {getPageTitle()}
        </h2>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <WorkspaceSwitcher />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 border border-primary/20 overflow-hidden"
            aria-label="User menu"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User avatar"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-primary">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </button>

          {profileOpen && (
            <>
              {/* Overlay listener */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setProfileOpen(false)}
              />

              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-md z-20 py-1.5 focus:outline-none">
                {/* User details summary */}
                <div className="px-3.5 py-2.5 border-b border-border">
                  <p className="text-sm font-bold text-foreground truncate">
                    {user?.displayName || "Member"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>

                <div className="p-1">
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                  <Link
                    href="/organizations"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Manage Workspaces</span>
                  </Link>
                </div>

                <div className="border-t border-border p-1 mt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
