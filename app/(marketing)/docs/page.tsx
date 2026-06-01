import Link from "next/link";
import {
  BookOpen,
  Terminal,
  Shield,
  Sparkles,
  FolderTree,
  Award,
} from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function DocsPage() {
  const sections = [
    {
      icon: <Terminal className="h-6 w-6 text-primary" />,
      title: "Getting Started",
      description:
        "Quick setup instructions. How to configure environment variables, run emulators, and initialize your database.",
      link: "/docs#get-started",
    },
    {
      icon: <FolderTree className="h-6 w-6 text-primary" />,
      title: "Project Structure",
      description:
        "Understand the feature-first directory layout. Learn where to place schemas, actions, and UI components.",
      link: "/docs#structure",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Security Rules",
      description:
        "Complete guide to Firestore & Storage rules. How we enforce tenant isolation and role-based permissions.",
      link: "/docs#security",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Firebase Genkit",
      description:
        "Learn how to build, run, and scale AI-powered workflows. Configure Gemini models and audit usage metrics.",
      link: "/docs#genkit",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-marketing">
      <MarketingHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center space-x-3 mb-6">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground font-marketing-heading">
            Documentation
          </h1>
        </div>

        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-12">
          Welcome to the FireSaaS Starter Kit developer guides. Learn how the
          architecture is wired and how to ship features quickly.
        </p>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="border border-border bg-card rounded-lg p-6 space-y-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  {section.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground font-marketing-heading">
                  {section.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.description}
              </p>
              <Link
                href={section.link}
                className="text-sm font-semibold text-primary hover:underline inline-block pt-1"
              >
                Read Guide →
              </Link>
            </div>
          ))}
        </div>

        {/* In-page Docs content stub */}
        <div className="space-y-12 border-t border-border pt-12">
          {/* Get Started Section */}
          <section id="get-started" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-marketing-heading">
              1. Getting Started
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To start building locally with FireSaaS, follow these commands:
            </p>
            <div className="bg-muted p-5 rounded-lg font-mono text-xs text-foreground space-y-2 overflow-x-auto">
              <div># 1. Install dependencies</div>
              <div className="text-primary font-semibold">pnpm install</div>
              <div className="pt-2"># 2. Copy environment template</div>
              <div className="text-primary font-semibold">
                cp .env.example .env
              </div>
              <div className="pt-2"># 3. Spin up local emulators</div>
              <div className="text-primary font-semibold">
                pnpm run dev:emulators
              </div>
              <div className="pt-2">
                # 4. In a separate shell, start the Next.js server
              </div>
              <div className="text-primary font-semibold">pnpm run dev</div>
            </div>
          </section>

          {/* Project Structure Section */}
          <section id="structure" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-marketing-heading">
              2. Project Structure
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The project is organized using a **feature-first** modular layout
              to keep related components and logic co-located.
            </p>
            <div className="bg-muted p-5 rounded-lg font-mono text-xs text-foreground leading-relaxed">
              <div>📁 features/</div>
              <div className="pl-4">
                📁 auth/ # React Auth context, server endpoints
              </div>
              <div className="pl-4">
                📁 users/ # User profile schema, sync actions
              </div>
              <div className="pl-4">
                📁 organizations/ # Workspaces switcher, settings & actions
              </div>
              <div className="pl-4">
                📁 files/ # Storage upload console and rules
              </div>
              <div className="pl-4">
                📁 ai/ # Genkit playground and usage log actions
              </div>
              <div className="pl-4">
                📁 admin/ # System dashboard controllers
              </div>
              <div className="pl-4">
                📁 audit-logs/ # Global audit logging helper
              </div>
            </div>
          </section>

          {/* Security Rules Section */}
          <section id="security" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-marketing-heading">
              3. Security Rules
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Multi-tenant security boundaries are strictly enforced. Rules
              written in `firestore.rules` and `storage.rules` verify that a
              user can only read or write documents belonging to workspaces
              where they have a membership.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Storage rules use cross-service Firestore checks
              (`firestore.exists()`) to dynamically inspect workspace
              memberships before allowing file access or uploads.
            </p>
          </section>

          {/* Genkit AI Section */}
          <section id="genkit" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground font-marketing-heading">
              4. Firebase Genkit
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We leverage Genkit to run AI workflows. Flows are defined inside
              `/genkit/flows`. Input and output shapes are validated using Zod,
              ensuring structured responses directly from Gemini models.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed font-semibold flex items-center text-primary">
              <Award className="h-4 w-4 mr-1.5" />
              Make sure to configure `GOOGLE_GENAI_API_KEY` in `.env` to connect
              to Gemini models.
            </p>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
