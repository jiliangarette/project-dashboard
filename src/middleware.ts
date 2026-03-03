import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // Check if OAuth is configured
  const isOAuthConfigured = 
    process.env.GITHUB_CLIENT_SECRET && 
    process.env.AUTH_SECRET;

  // Redirect root to demo if OAuth not configured
  if (!isOAuthConfigured && req.nextUrl.pathname === "/") {
    const demoUrl = new URL("/demo", req.nextUrl.origin);
    return NextResponse.redirect(demoUrl);
  }

  // Require auth only if OAuth is configured and not on demo/public routes
  if (!req.auth && isOAuthConfigured) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  // Exclude demo, login, api, static files, error pages, and settings from auth check
  matcher: ["/((?!demo|login|api|_next/static|_next/image|favicon.ico|error|settings).*)"],
};
