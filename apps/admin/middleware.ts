import { auth } from "@churchflow/auth";
import { NextResponse } from "next/server";

/**
 * Routes that require specific roles.
 * Key: route prefix, Value: list of roles that are allowed access.
 */
const ROLE_RESTRICTED_ROUTES: Record<string, string[]> = {
  "/dashboard/administration": ["ADMIN", "SUPER_ADMIN"],
  "/dashboard/permissions": ["ADMIN", "SUPER_ADMIN"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // 1. Protect /dashboard and all nested paths
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Role-based access control for sensitive sub-routes
    const userRoles: string[] = (session.user as any)?.roles ?? [];

    for (const [route, requiredRoles] of Object.entries(ROLE_RESTRICTED_ROUTES)) {
      if (pathname.startsWith(route)) {
        const hasAccess = requiredRoles.some((r) => userRoles.includes(r));
        if (!hasAccess) {
          const dashboardUrl = new URL("/dashboard?error=unauthorized", req.url);
          return NextResponse.redirect(dashboardUrl);
        }
      }
    }
  }

  // 3. Redirect already-authenticated users away from /login and /
  if (pathname === "/login" || pathname === "/") {
    if (session) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
};
