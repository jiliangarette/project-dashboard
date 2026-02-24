import { NextResponse } from "next/server";
import { readClaudeMd, listMdFiles, readMdFile } from "@/lib/file-io";
import { PROJECT_NAMES } from "@/lib/constants";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const { project } = await params;
  if (!PROJECT_NAMES.includes(project)) {
    return NextResponse.json({ error: "Invalid project" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  // If a specific file is requested, return its content
  if (file) {
    if (!file.endsWith(".md")) {
      return NextResponse.json({ error: "Only .md files" }, { status: 400 });
    }
    const content = await readMdFile(project, file);
    if (content === null) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return NextResponse.json({ name: file, content });
  }

  // Otherwise return CLAUDE.md + list of all md files
  const claudeMd = await readClaudeMd(project);
  const mdFiles = await listMdFiles(project);

  return NextResponse.json({
    claudeMd,
    files: mdFiles.map((f) => f.name),
  });
}
