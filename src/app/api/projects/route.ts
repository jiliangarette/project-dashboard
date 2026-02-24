import { NextResponse } from "next/server";
import { getProjectSummaries } from "@/lib/file-io";

export async function GET() {
  const summaries = await getProjectSummaries();
  return NextResponse.json(summaries);
}
