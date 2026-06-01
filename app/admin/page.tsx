import { getCurrentUser } from "@/features/auth/server";
import { adminDb } from "@/firebase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Building2,
  Sparkles,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS || "admin@firesaas.dev,mahesh@firesaas.dev"
).split(",");

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const claims = await getCurrentUser();

  // If not logged in, redirect to sign-in
  if (!claims) {
    redirect("/sign-in?redirect=/admin");
  }

  const userEmail = claims.email || "";
  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  // 1. Guard check: Access Denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full border border-destructive/20 bg-destructive/5 rounded-lg p-8 text-center space-y-6 shadow-sm">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Access Denied
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account (
              <span className="font-bold text-foreground">{userEmail}</span>) is
              not configured as a system admin in the environment variables.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md border border-border bg-card hover:bg-muted font-semibold h-10 px-6 text-sm transition-all shadow-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Admin dashboard data fetching (Admin SDK bypasses tenant rules)
  let totalUsers = 0;
  let totalOrgs = 0;
  const systemUsersList: Array<{
    id: string;
    email: string;
    displayName: string;
  }> = [];
  const systemOrgsList: Array<{ id: string; name: string; plan: string }> = [];

  try {
    const usersSnap = await adminDb.collection("users").get();
    totalUsers = usersSnap.size;
    usersSnap.forEach((doc) => {
      const data = doc.data();
      systemUsersList.push({
        id: doc.id,
        email: data.email || "",
        displayName: data.displayName || "Unknown User",
      });
    });

    const orgsSnap = await adminDb.collection("organizations").get();
    totalOrgs = orgsSnap.size;
    orgsSnap.forEach((doc) => {
      const data = doc.data();
      systemOrgsList.push({
        id: doc.id,
        name: data.name || "",
        plan: data.plan || "free",
      });
    });
  } catch (err) {
    console.error("Admin data fetch error:", err);
  }

  const isEmulator = !!(
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.FIRESTORE_EMULATOR_HOST
  );

  return (
    <div className="min-h-screen bg-muted/10 font-sans">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-40 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-4 w-px bg-border" />
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Admin Console</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xxs font-mono bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-bold">
            System Admin Root
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content grid */}
      <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        {/* Banner */}
        <div className="bg-card border border-border/80 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              System Health & Metrics
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor active tenants, registered client accounts, and emulator
              runtime indicators.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                isEmulator
                  ? "border-amber-500/20 bg-amber-500/5 text-amber-500"
                  : "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
              }`}
            >
              <Activity className="h-4 w-4" />
              {isEmulator ? "Firebase Emulator Mode" : "Production Mode"}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                Total Accounts
              </span>
            </div>
            <h4 className="text-3xl font-bold text-foreground tracking-tight">
              {totalUsers} Users
            </h4>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                Workspaces Created
              </span>
            </div>
            <h4 className="text-3xl font-bold text-foreground tracking-tight">
              {totalOrgs} Tenants
            </h4>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                Next.js Framework
              </span>
            </div>
            <h4 className="text-3xl font-bold text-foreground tracking-tight">
              v16.x
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Users List */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-foreground">
              Registered User Roster
            </h3>
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {systemUsersList.map((usr) => (
                <div
                  key={usr.id}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-foreground truncate">
                      {usr.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {usr.email}
                    </p>
                  </div>
                  <span className="text-xxs font-mono bg-muted border border-border px-2 py-0.5 rounded-md text-muted-foreground">
                    {usr.id.substring(0, 8)}...
                  </span>
                </div>
              ))}
              {systemUsersList.length === 0 && (
                <p className="text-center py-8 text-xs text-muted-foreground italic">
                  No users found.
                </p>
              )}
            </div>
          </div>

          {/* Organizations List */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-foreground">
              System Tenants
            </h3>
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {systemOrgsList.map((org) => (
                <div
                  key={org.id}
                  className="py-3 flex items-center justify-between text-sm"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-foreground truncate">
                      {org.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      ID: {org.id.substring(0, 8)}...
                    </p>
                  </div>
                  <span className="text-xxs font-semibold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full capitalize">
                    {org.plan}
                  </span>
                </div>
              ))}
              {systemOrgsList.length === 0 && (
                <p className="text-center py-8 text-xs text-muted-foreground italic">
                  No workspaces found.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
