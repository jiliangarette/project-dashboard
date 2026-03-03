import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchUserRepos } from "@/lib/github";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repos, rateLimit } = await fetchUserRepos(session.accessToken);

    return NextResponse.json({ repos, rateLimit }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching repos:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
