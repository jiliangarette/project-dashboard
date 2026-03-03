import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // If not authenticated, redirect to login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  // Exclude demo, project detail pages, login, api, static files, error pages, and settings from auth check
  matcher: ["/((?!demo|project|login|api|_next/static|_next/image|favicon.ico|error|settings).*)"],
};
