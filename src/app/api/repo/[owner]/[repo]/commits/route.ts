import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchRepoCommits } from "@/lib/github";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { owner, repo } = await params;
    
    // Fetch last 1 year of commits — no limit on project detail pages
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const commits = await fetchRepoCommits(owner, repo, session.accessToken, oneYearAgo.toISOString());

    return NextResponse.json({ commits }, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching commits:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch commits" },
      { status: 500 }
    );
  }
}
