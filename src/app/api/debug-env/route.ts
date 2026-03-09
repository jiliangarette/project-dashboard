import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? `${process.env.GITHUB_CLIENT_ID.substring(0, 6)}...` : "MISSING",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? `set (${process.env.GITHUB_CLIENT_SECRET.length} chars)` : "MISSING",
    AUTH_SECRET: process.env.AUTH_SECRET ? `set (${process.env.AUTH_SECRET.length} chars)` : "MISSING",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? `set (${process.env.NEXTAUTH_SECRET.length} chars)` : "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  });
}
