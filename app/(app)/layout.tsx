"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // If auth is loading, render a splash spinner
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold">
            Initializing session...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, we return null (the middleware will handle redirection)
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main app container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />

        {/* Scrollable Content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
