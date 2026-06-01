"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { db } from "@/firebase/client";
import { useAuth } from "@/features/auth/AuthContext";
import { updateUserProfile } from "@/features/users/actions";
import {
  syncProfileInputSchema,
  SyncProfileInput,
} from "@/features/users/schema";
import {
  User,
  Moon,
  Sun,
  Monitor,
  Loader2,
  CreditCard,
  Bell,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SyncProfileInput>({
    resolver: zodResolver(syncProfileInputSchema),
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!user) return;

    // Listen to current user profile doc in Firestore
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Pre-fill form fields
          if (data.displayName) setValue("displayName", data.displayName);
          if (data.photoURL) setValue("photoURL", data.photoURL);
          if (data.timezone) setValue("timezone", data.timezone);
          if (data.locale) setValue("locale", data.locale);
        }
      },
      (error) => {
        console.warn("Unauthorized to listen to user profile settings:", error);
      },
    );

    return () => unsubscribe();
  }, [user, setValue]);

  const handleProfileUpdate = async (values: SyncProfileInput) => {
    setSubmitting(true);
    try {
      await updateUserProfile(values);
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update profile settings.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="border-b border-border/60 pb-5 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure profile fields, change appearance theme, and link payments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile forms (2/3 col) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Public Profile Card */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <User className="h-4.5 w-4.5 text-primary" />
              <span>Public Profile</span>
            </h3>

            <form
              onSubmit={handleSubmit(handleProfileUpdate)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    {...register("displayName")}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Mahesh Kumar"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.displayName.message}
                    </p>
                  )}
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="text"
                    {...register("photoURL")}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {errors.photoURL && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.photoURL.message}
                    </p>
                  )}
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Time Zone
                  </label>
                  <select
                    {...register("timezone")}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">
                      America/New_York (EST)
                    </option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="UTC">
                      Coordinated Universal Time (UTC)
                    </option>
                  </select>
                </div>

                {/* Locale */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Preferred Locale
                  </label>
                  <select
                    {...register("locale")}
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-9 px-6 text-sm transition-all disabled:opacity-50 shadow-sm"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Theme appearance settings */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <Globe className="h-4.5 w-4.5 text-primary" />
              <span>Theme Appearance</span>
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Light mode */}
              <button
                onClick={() => setTheme("light")}
                className={`p-4 border rounded-md flex flex-col items-center gap-2 transition-all ${
                  theme === "light"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="h-6 w-6" />
                <span className="text-xs font-bold">Light Mode</span>
              </button>

              {/* Dark mode */}
              <button
                onClick={() => setTheme("dark")}
                className={`p-4 border rounded-md flex flex-col items-center gap-2 transition-all ${
                  theme === "dark"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="h-6 w-6" />
                <span className="text-xs font-bold">Dark Mode</span>
              </button>

              {/* System theme */}
              <button
                onClick={() => setTheme("system")}
                className={`p-4 border rounded-md flex flex-col items-center gap-2 transition-all ${
                  theme === "system"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-xs font-bold">System Default</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar settings links / stubs (1/3 col) */}
        <div className="space-y-6">
          {/* Billing Quick link */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <CreditCard className="h-4.5 w-4.5 text-primary" />
              <span>Workspace Billing</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Check usage stats, manage subscription tiers, and review past
              invoices.
            </p>
            <Link
              href="/billing"
              className="w-full inline-flex items-center justify-center rounded-md border border-border bg-card hover:bg-muted font-semibold text-sm h-9 transition-colors shadow-sm"
            >
              Configure Billing
            </Link>
          </div>

          {/* Stubs list */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <Bell className="h-4.5 w-4.5 text-primary" />
              <span>Future Settings (TODO)</span>
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full shrink-0" />
                <span>Multi-factor authentication (MFA) stubs.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full shrink-0" />
                <span>Email notification dispatch rules.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full shrink-0" />
                <span>OAuth credentials credential linking keys.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
