import {
  Sparkles,
  TestTube,
  Cpu,
  Layers,
  Fingerprint,
  Files,
  Boxes,
  Zap,
  Globe,
} from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: <Fingerprint className="h-6 w-6 text-primary" />,
      title: "Firebase Auth Flow",
      description:
        "Ready-to-use forms for Sign Up, Sign In, Password Reset, and Google Sign-in. Synchronizes seamlessly with server sessions using secure HTTP-only cookies.",
    },
    {
      icon: <Layers className="h-6 w-6 text-primary" />,
      title: "Multi-Tenant Workspaces",
      description:
        "Enable teams to collaborate in isolated workspaces. Custom permissions prevent data leaks, fully governed by Firestore security rules.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Genkit AI Playground",
      description:
        "Ship AI-powered features with Firebase Genkit. Includes pre-wired flows for text summaries, JSON object responses, and stateful chat.",
    },
    {
      icon: <Files className="h-6 w-6 text-primary" />,
      title: "File Upload & Management",
      description:
        "Handle media uploads with Firebase Storage. Validates size, content-type, and routes files into tenant-isolated folders.",
    },
    {
      icon: <TestTube className="h-6 w-6 text-primary" />,
      title: "Comprehensive Test Pyramid",
      description:
        "Ship code with confidence. Unit testing, Firestore & Storage security rules testing with emulator hooks, and Playwright E2E checks.",
    },
    {
      icon: <Boxes className="h-6 w-6 text-primary" />,
      title: "Shadcn & Tailwind v4",
      description:
        "Curated styling setup using Tailwind CSS v4, dark mode support, next-themes, and reusable responsive layout components.",
    },
  ];

  const dxBenefits = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Zero-Config Emulator",
      description:
        "Run Auth, Firestore, and Storage offline locally. Seed initial data and test rules in sandbox environments.",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "App Hosting Ready",
      description:
        "Deployment configurations for Firebase App Hosting and Vercel are pre-baked into the architecture.",
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      title: "Strict Type Contracts",
      description:
        "Pervasive Zod schemas validate environment variables, API endpoints, Server Actions, and AI inputs.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-marketing">
      <MarketingHeader />

      <main className="flex-1 py-16 lg:py-24">
        {/* Header */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 max-w-3xl mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-marketing-heading">
            A Complete Tech Stack, Fully Pre-Wired
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Stop stitching libraries. FireSaaS compiles auth, data isolation,
            uploads, AI workflows, and tests into a polished boilerplate.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="border border-border bg-card rounded-lg p-8 space-y-4 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px]"
              >
                <div className="h-12 w-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground font-marketing-heading">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DX Benefits */}
        <div className="border-t border-border bg-muted/20 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground font-marketing-heading">
                Engineered for Modern Developer Workflows
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                FireSaaS starter kit prioritizes developer experience, rapid
                iteration speeds, and production stability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {dxBenefits.map((item, idx) => (
                <div
                  key={idx}
                  className="space-y-3 p-6 bg-card border border-border rounded-lg shadow-sm"
                >
                  <div className="text-primary">{item.icon}</div>
                  <h4 className="text-base font-bold text-foreground font-marketing-heading">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
