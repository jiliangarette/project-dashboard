import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchRepoInfo } from "@/lib/github";

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
    const repoData = await fetchRepoInfo(owner, repo, session.accessToken);

    return NextResponse.json({ repo: repoData }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching repo:", error);

    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch repository" },
      { status: 500 }
    );
  }
}
