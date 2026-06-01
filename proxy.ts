import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/settings",
  "/files",
  "/ai",
  "/admin",
  "/organizations",
  "/billing",
];
const authRoutes = ["/sign-in", "/sign-up", "/reset-password"];

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("__session")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Skip redirecting Server Action requests
  const isServerAction = request.headers.has("next-action");

  // If path is protected and no session is found, redirect to sign-in
  if (isProtectedRoute && !session && !isServerAction) {
    const url = new URL("/sign-in", request.url);
    // Keep target path in redirect search param so we can route user back
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If user is already signed in and tries to access login/register, send to dashboard
  if (isAuthRoute && session && !isServerAction) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/files/:path*",
    "/ai/:path*",
    "/admin/:path*",
    "/organizations/:path*",
    "/billing/:path*",
    "/sign-in",
    "/sign-up",
    "/reset-password",
  ],
};
