"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Settings,
  FolderOpen,
  Sparkles,
  Building2,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthContext";

// Simple custom admin checker email list matching env.ts
const ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
  "admin@firesaas.dev,mahesh@firesaas.dev"
).split(",");

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/organizations",
      label: "Workspaces",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      href: "/files",
      label: "Files",
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      href: "/ai",
      label: "AI Playground",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/images/firesaas-logo-wide-1024.png"
            alt="FireSaaS Logo"
            width={105}
            height={28}
            className="object-contain dark:hidden"
            style={{ width: "auto", height: "auto" }}
            priority
          />
          <Image
            src="/images/firesaas-logo-wide-light-1024.png"
            alt="FireSaaS Logo"
            width={105}
            height={28}
            className="hidden object-contain dark:block"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Admin Section if eligible */}
        {isAdmin && (
          <div className="pt-6 border-t border-border/60 mt-6">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              System Admin
            </p>
            <Link
              href="/admin"
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                pathname.startsWith("/admin")
                  ? "bg-destructive/10 text-destructive"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <ShieldAlert className="h-5 w-5" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer controls */}
      <div className="p-4 border-t border-border/60">
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
