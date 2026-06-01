import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  TestTube,
  Cpu,
  Database,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen font-marketing">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-radial-[at_top_right_rgba(234,88,12,0.15)_0%,transparent_50%]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 max-w-4xl relative z-10">
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Version 1.0 is now live</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] font-marketing-heading">
              Build AI-Powered SaaS Products{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Faster
              </span>{" "}
              with Next.js and Firebase
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              FireSaaS gives you Authentication, Multi-tenant Organizations,
              Firestore, Storage, Genkit AI flows, complete tests, and modular
              architecture out of the box.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-12 px-8 transition-all hover:translate-y-[-2px] shadow-md"
              >
                <span>Get Started Free</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/docs"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-border bg-card hover:bg-muted font-semibold h-12 px-8 transition-colors"
              >
                Read Documentation
              </Link>
            </div>

            {/* Dashboard Mockup Placeholder */}
            <div className="mt-16 border border-border/80 rounded-lg p-2 bg-muted/30 shadow-md relative">
              <div className="aspect-[16/9] w-full bg-card rounded-lg border border-border/40 overflow-hidden flex flex-col items-start justify-start text-left p-6 space-y-4">
                <div className="flex items-center justify-between w-full border-b border-border/40 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-3.5 w-3.5 rounded-full bg-red-500/80" />
                    <div className="h-3.5 w-3.5 rounded-full bg-yellow-500/80" />
                    <div className="h-3.5 w-3.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    dashboard.firesaas.dev
                  </div>
                  <div className="w-12" />
                </div>
                <div className="grid grid-cols-3 gap-6 w-full h-full pt-2">
                  <div className="col-span-1 border-r border-border/40 space-y-4 pr-4">
                    <div className="h-6 w-32 bg-primary/10 rounded-md border border-primary/20" />
                    <div className="h-4 w-full bg-muted rounded-md" />
                    <div className="h-4 w-4/5 bg-muted rounded-md" />
                    <div className="h-4 w-3/4 bg-muted rounded-md" />
                  </div>
                  <div className="col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-20 border border-border/40 rounded-lg p-4 bg-muted/10 space-y-2">
                        <div className="h-3 w-16 bg-muted rounded-md" />
                        <div className="h-6 w-12 bg-foreground/10 rounded-md" />
                      </div>
                      <div className="h-20 border border-border/40 rounded-lg p-4 bg-muted/10 space-y-2">
                        <div className="h-3 w-16 bg-muted rounded-md" />
                        <div className="h-6 w-12 bg-foreground/10 rounded-md" />
                      </div>
                    </div>
                    <div className="h-28 border border-border/40 rounded-lg p-4 bg-muted/10 space-y-3">
                      <div className="h-4 w-28 bg-muted rounded-md" />
                      <div className="h-2 w-full bg-muted rounded-md" />
                      <div className="h-2 w-full bg-muted rounded-md" />
                      <div className="h-2 w-4/5 bg-muted rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-marketing-heading">
                Everything You Need to Ship Next-Gen SaaS
              </h2>
              <p className="text-base text-muted-foreground">
                Don&apos;t waste weeks wiring auth, tenant boundaries, uploads,
                and AI integration. Focus on your unique product features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="border border-border bg-card rounded-lg p-8 space-y-4 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-marketing-heading">
                  Firebase Native Auth
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Secure Client-side Sign-in/Sign-up combined with Server-Side
                  token verification using the Admin SDK. Full Google and Email
                  support.
                </p>
              </div>

              {/* Card 2 */}
              <div className="border border-border bg-card rounded-lg p-8 space-y-4 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-marketing-heading">
                  Multi-Tenancy Workspace
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Strict organization isolation model with role management
                  (`owner`, `admin`, `member`, `viewer`) and robust
                  Firestore/Storage security rules.
                </p>
              </div>

              {/* Card 3 */}
              <div className="border border-border bg-card rounded-lg p-8 space-y-4 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-marketing-heading">
                  Genkit AI Integration
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  First-class AI orchestration with Genkit. Built-in flows for
                  text summarization, structured JSON schema response, and
                  conversational chat.
                </p>
              </div>

              {/* Card 4 */}
              <div className="border border-border bg-card rounded-lg p-8 space-y-4 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-marketing-heading">
                  Tenant Isolated Storage
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Secure file manager powered by Firebase Storage. Upload, size,
                  and mime-type validations are strictly enforced client and
                  server-side.
                </p>
              </div>

              {/* Card 5 */}
              <div className="border border-border bg-card rounded-lg p-8 space-y-4 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <TestTube className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-marketing-heading">
                  Full-Stack Test Suite
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A comprehensive testing system. Unit tests, integration tests
                  with Emulators, security rules tests, and Playwright E2E
                  automation.
                </p>
              </div>

              {/* Card 6 */}
              <div className="border border-border bg-card rounded-lg p-8 space-y-4 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground font-marketing-heading">
                  Developer-First DX
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Next.js App Router setup with hot-reloading, pre-configured
                  Firebase emulators, Zod schema validation, dark/light theme,
                  and clear guides.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground font-marketing-heading">
                Simple, Transparent Pricing
              </h2>
              <p className="text-base text-muted-foreground">
                No surprises. Scale your SaaS with ease.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free tier */}
              <div className="border border-border bg-card rounded-lg p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-muted-foreground font-marketing-heading">
                    Free
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-foreground">
                      $0
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      / month
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Perfect for staging, evaluation, and indie prototyping.
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground border-t border-border/40 pt-6">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>1 Workspace</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>Up to 3 members</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>100MB File storage</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>Basic AI flows</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/sign-up"
                  className="mt-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted py-2 text-sm font-semibold transition-colors w-full"
                >
                  Start Prototyping
                </Link>
              </div>

              {/* Pro tier */}
              <div className="border-2 border-primary bg-card rounded-lg p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-bl-md uppercase tracking-wider">
                  Popular
                </div>
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-primary font-marketing-heading">
                    Pro
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-foreground">
                      $29
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      / month
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For growing startups, SaaS builders, and small agency teams.
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground border-t border-border/40 pt-6">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>Unlimited Workspaces</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>Up to 15 members</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>10GB Secure File storage</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>Custom Genkit AI endpoints</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/sign-up"
                  className="mt-8 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 py-2.5 text-sm transition-all shadow-md w-full"
                >
                  Get Pro Access
                </Link>
              </div>

              {/* Enterprise tier */}
              <div className="border border-border bg-card rounded-lg p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-muted-foreground font-marketing-heading">
                    Business
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-foreground">
                      $149
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      / month
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    For scaled systems, enterprise audits, and advanced needs.
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground border-t border-border/40 pt-6">
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>Unlimited Workspaces</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>Unlimited members</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>100GB Storage & Custom CDN</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                      <span>Audit Logs & SLA uptime</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/sign-up"
                  className="mt-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted py-2 text-sm font-semibold transition-colors w-full"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/20 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground font-marketing-heading">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-muted-foreground">
                Have questions about the FireSaaS starter kit? We have answers.
              </p>
            </div>

            <div className="space-y-8">
              <div className="border-b border-border/60 pb-6 space-y-2">
                <h4 className="text-base font-bold text-foreground font-marketing-heading">
                  Is this project pre-configured for local emulators?
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Yes, fully! When running in development, the client and admin
                  SDKs automatically connect to local Firebase Emulators (Auth
                  on port 9099, Firestore on port 8080, and Storage on port
                  9199).
                </p>
              </div>
              <div className="border-b border-border/60 pb-6 space-y-2">
                <h4 className="text-base font-bold text-foreground font-marketing-heading">
                  How does multi-tenancy access work?
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every user belongs to one or more organizations. Resource
                  collections are organized nested under organizations or
                  verified against membership documents using Firestore security
                  rules.
                </p>
              </div>
              <div className="border-b border-border/60 pb-6 space-y-2">
                <h4 className="text-base font-bold text-foreground font-marketing-heading">
                  Is Genkit configured for production model routing?
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Yes, Genkit flows are defined inside `/genkit/flows`. Models
                  are configurable via environment variables (`AI_TEXT_MODEL`,
                  etc.) making it simple to toggle between Flash and Pro
                  variants of Gemini.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 text-center relative overflow-hidden bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-marketing-heading">
              Ready to Ship Your SaaS Project Today?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Start building with a production-grade, highly secure, fully
              tested foundation. Deploy on Vercel or Firebase App Hosting in
              minutes.
            </p>
            <div className="pt-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-12 px-8 shadow-md hover:translate-y-[-2px] transition-all"
              >
                Create Your Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
