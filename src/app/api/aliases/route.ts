import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ALIASES_FILE = path.join(process.cwd(), "data", "aliases.json");

async function readAliases(): Promise<Record<string, string>> {
  try {
    const data = await fs.readFile(ALIASES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeAliases(aliases: Record<string, string>): Promise<void> {
  await fs.mkdir(path.dirname(ALIASES_FILE), { recursive: true });
  await fs.writeFile(ALIASES_FILE, JSON.stringify(aliases, null, 2), "utf-8");
}

export async function GET() {
  try {
    const aliases = await readAliases();
    return NextResponse.json(aliases);
  } catch (error) {
    console.error("Error reading aliases:", error);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { repoId, alias } = await request.json();

    if (!repoId) {
      return NextResponse.json({ error: "repoId is required" }, { status: 400 });
    }

    const aliases = await readAliases();
    const key = String(repoId);
    const trimmed = (alias || "").trim();

    if (!trimmed) {
      delete aliases[key];
    } else {
      aliases[key] = trimmed;
    }

    await writeAliases(aliases);
    return NextResponse.json(aliases);
  } catch (error) {
    console.error("Error saving alias:", error);
    return NextResponse.json({ error: "Failed to save alias" }, { status: 500 });
  }
}
