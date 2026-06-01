import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      description:
        "For hobbyists, validation tests, and offline emulator development.",
      features: [
        "1 Workspace",
        "Up to 3 team members",
        "100MB File storage",
        "Basic Genkit AI flows",
        "Standard theme support",
        "Vitest local testing suite",
      ],
      ctaText: "Get Started Free",
      href: "/sign-up",
      popular: false,
    },
    {
      name: "Pro",
      price: "$29",
      description:
        "For active SaaS products, startups, agencies, and indie hackers.",
      features: [
        "Unlimited Workspaces",
        "Up to 15 team members",
        "10GB Secure File storage",
        "Custom Genkit AI endpoints",
        "Audit log integrations",
        "Priority email support",
      ],
      ctaText: "Upgrade to Pro",
      href: "/sign-up",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$149",
      description:
        "For scaled SaaS systems requiring SLA guarantees and audit features.",
      features: [
        "Unlimited Workspaces",
        "Unlimited team members",
        "100GB Storage & custom CDN",
        "Advanced AI logging dashboards",
        "Audit logs & compliance reports",
        "SLA uptime guarantees",
      ],
      ctaText: "Contact Sales",
      href: "mailto:sales@firesaas.dev",
      popular: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-marketing">
      <MarketingHeader />

      <main className="flex-1 py-16 lg:py-24">
        {/* Header */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 max-w-3xl mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-marketing-heading">
            Sized for Startups, Built to Scale
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Choose the plan that fits your execution pace. Start locally on the
            free tier and scale to production as you grow.
          </p>
        </div>

        {/* Pricing Tiers Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`border bg-card rounded-lg p-8 flex flex-col justify-between shadow-md relative overflow-hidden ${
                  tier.popular
                    ? "border-2 border-primary scale-105 md:translate-y-[-4px]"
                    : "border-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-bl-md uppercase tracking-wider">
                    Popular
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3
                      className={`text-xl font-bold font-marketing-heading ${tier.popular ? "text-primary" : "text-foreground"}`}
                    >
                      {tier.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
                      {tier.description}
                    </p>
                  </div>

                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-foreground">
                      {tier.price}
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      / month
                    </span>
                  </div>

                  <ul className="space-y-3.5 text-sm text-muted-foreground border-t border-border/40 pt-6">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center">
                        <CheckCircle2 className="h-4.5 w-4.5 text-primary mr-2.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={tier.href}
                  className={`mt-8 inline-flex items-center justify-center rounded-md font-semibold py-3 text-sm transition-all w-full ${
                    tier.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:translate-y-[-1px]"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  {tier.popular && <ArrowRight className="ml-2 h-4 w-4" />}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
