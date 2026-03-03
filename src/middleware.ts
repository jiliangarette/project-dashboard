import { auth } from "@/auth";

export default auth((req) => {
  // Allow demo routes without auth
  if (req.nextUrl.pathname.startsWith("/demo")) {
    return;
  }

  // Check if OAuth is configured
  const isOAuthConfigured = 
    process.env.GITHUB_CLIENT_SECRET && 
    process.env.AUTH_SECRET;

  // Redirect root to demo if OAuth not configured
  if (!isOAuthConfigured && req.nextUrl.pathname === "/") {
    const demoUrl = new URL("/demo", req.nextUrl.origin);
    return Response.redirect(demoUrl);
  }

  if (!req.auth && isOAuthConfigured) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|error|settings).*)"],
};
