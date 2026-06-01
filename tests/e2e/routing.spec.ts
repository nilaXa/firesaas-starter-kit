import { test, expect } from "@playwright/test";

test.describe("Public Routing & Landing Page Checks", () => {
  test("landing page renders successfully", async ({ page }) => {
    await page.goto("/");
    // Check main title content
    await expect(page.locator("h1")).toContainText(
      "Build AI-Powered SaaS Products",
    );
    // Verify brand link exists
    await expect(
      page.getByRole("link", { name: "FireSaaS Logo" }).first(),
    ).toBeVisible();
  });

  test("features page renders successfully", async ({ page }) => {
    await page.goto("/features");
    await expect(page.locator("h1")).toContainText(
      "A Complete Tech Stack, Fully Pre-Wired",
    );
  });

  test("pricing page renders successfully", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("h1")).toContainText(
      "Sized for Startups, Built to Scale",
    );
  });

  test("sign-in page loads standard login inputs", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("h2")).toContainText("Sign in to your account");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("sign-up page loads registration forms", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator("h2")).toContainText("Create your free account");
  });
});

test.describe("Auth Guards & Session Redirect Checks", () => {
  test("redirects unauthenticated users trying to hit the dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    // Verify user is redirected to sign-in page
    await expect(page).toHaveURL(/.*sign-in.*/);
    // Redirect query parameter should preserve target page path
    const url = new URL(page.url());
    expect(url.searchParams.get("redirect")).toBe("/dashboard");
  });
});
