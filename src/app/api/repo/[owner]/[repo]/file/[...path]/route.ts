import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchRepoFile } from "@/lib/github";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; path: string[] }> }
) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { owner, repo, path } = await params;
    const filePath = path.join("/");

    const content = await fetchRepoFile(owner, repo, filePath, session.accessToken);

    if (content === null) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch file" },
      { status: 500 }
    );
  }
}
