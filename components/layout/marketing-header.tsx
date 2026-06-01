"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/firesaas-logo-wide-1024.png"
            alt="FireSaaS Logo"
            width={120}
            height={32}
            className="object-contain dark:hidden"
            style={{ width: "auto", height: "auto" }}
            priority
          />
          <Image
            src="/images/firesaas-logo-wide-light-1024.png"
            alt="FireSaaS Logo"
            width={120}
            height={32}
            className="hidden object-contain dark:block"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
          <Link
            href="/features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            className="hover:text-foreground transition-colors"
          >
            Docs
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors px-3 py-2 rounded-md"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="hidden sm:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
