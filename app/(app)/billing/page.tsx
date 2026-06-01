"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/client";
import {
  Building2,
  CreditCard,
  Check,
  Zap,
  FileCode,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export default function BillingPage() {
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveOrgId(localStorage.getItem("active_org_id"));
    const interval = setInterval(() => {
      const current = localStorage.getItem("active_org_id");
      if (current !== activeOrgId) {
        setActiveOrgId(current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeOrgId]);

  useEffect(() => {
    if (!activeOrgId) {
      return;
    }

    const orgRef = doc(db, "organizations", activeOrgId);
    const unsub = onSnapshot(
      orgRef,
      (snap) => {
        if (snap.exists()) {
          setPlan(snap.data().plan || "free");
        }
      },
      (error) => {
        console.warn("Unauthorized to view billing for this org:", error);
      },
    );

    return () => unsub();
  }, [activeOrgId]);

  const handleUpgrade = () => {
    toast.info(
      "Stripe integration is a placeholder. See docs/deployment.md to configure billing hook sync.",
    );
  };

  const plansList = [
    {
      name: "free",
      price: "$0",
      description: "For testing and emulator development.",
      features: [
        "1 Workspace",
        "3 Members maximum",
        "100MB File storage",
        "Basic AI summaries",
      ],
    },
    {
      name: "pro",
      price: "$29",
      description: "For active SaaS startups and agencies.",
      features: [
        "Unlimited Workspaces",
        "15 Members",
        "10GB Secure File storage",
        "Full AI flow access",
      ],
    },
    {
      name: "business",
      price: "$149",
      description: "For enterprise SLAs and scale.",
      features: [
        "Unlimited Workspaces",
        "Unlimited Members",
        "100GB Storage",
        "Audit compliance logs",
      ],
    },
  ];

  if (!activeOrgId) {
    return (
      <div className="border border-dashed border-border rounded-lg p-16 text-center space-y-4 bg-card shadow-sm">
        <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground italic">
          Select or create a workspace to view billing details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="border-b border-border/60 pb-5 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Billing Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage subscriptions, credit cards, and billing integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Active subscription summary (2/3 col) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active plan card */}
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  Current Subscription
                </h3>
                <p className="text-xs text-muted-foreground">
                  Active Workspace Plan
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 capitalize">
                {plan} Plan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment Status
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>No card on file (Demo)</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Billing cycle
                </p>
                <p className="text-sm text-foreground">
                  Renews automatically every month (placeholder)
                </p>
              </div>
            </div>

            {/* Billing checklist */}
            <div className="border-t border-border/60 pt-6 space-y-4">
              <h4 className="text-sm font-bold text-foreground">
                Future Stripe Integration Blueprint:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>Secure Stripe Checkout session redirections.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>Customer portal for self-serve card updates.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>Webhook event syncing with Cloud Functions / Next API.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>Usage-based AI execution credit deductions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing tiers selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {plansList.map((tier) => {
              const isActive = tier.name === plan;
              return (
                <div
                  key={tier.name}
                  className={`bg-card border rounded-lg p-6 flex flex-col justify-between shadow-xs ${
                    isActive ? "border-2 border-primary" : "border-border"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold capitalize text-foreground">
                        {tier.name}
                      </span>
                      {isActive && (
                        <span className="text-xxs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-foreground">
                        {tier.price}
                      </span>
                      <span className="text-xxs text-muted-foreground ml-1">
                        /mo
                      </span>
                    </div>
                    <p className="text-xxs text-muted-foreground min-h-[32px]">
                      {tier.description}
                    </p>
                    <ul className="space-y-2 text-xxs text-muted-foreground border-t border-border/40 pt-4">
                      {tier.features.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {!isActive && (
                    <button
                      onClick={handleUpgrade}
                      className="mt-6 w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 h-8 transition-colors shadow-sm"
                    >
                      <Zap className="h-3 w-3 mr-1.5" />
                      <span>Upgrade</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Stripe Hook Guide (1/3 col) */}
        <div className="space-y-6 min-w-0">
          <div className="bg-card border border-border/80 rounded-lg p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <FileCode className="h-5 w-5 text-primary" />
              <span>Developer Reference</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stripe billing hooks can sync data to organization records. To
              configure the backend:
            </p>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">1. Install SDK</p>
                <code className="block bg-muted/60 border border-border/40 p-2.5 rounded font-mono text-[11px] text-primary overflow-x-auto">
                  pnpm add stripe
                </code>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  2. Add Webhook Route
                </p>
                <code className="block bg-muted/60 border border-border/40 p-2.5 rounded font-mono text-[11px] text-muted-foreground overflow-x-auto">
                  app/api/webhooks/stripe/route.ts
                </code>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  3. Sync Plan Status
                </p>
                <code className="block bg-muted/60 border border-border/40 p-2.5 rounded font-mono text-[11px] text-muted-foreground overflow-x-auto">
                  {
                    'adminDb.doc("organizations/{orgId}").update({ plan: "pro" })'
                  }
                </code>
              </div>
            </div>

            <div className="border border-amber-500/20 bg-amber-500/5 p-4 rounded-md flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ensure you verify the Stripe signature webhook header
                (`stripe-signature`) using the webhook signing secret key in
                production.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
