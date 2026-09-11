import { NextResponse } from "next/server";
import { relayFetch, requireOwner, RELAY_OFFLINE } from "@/lib/relay";

export const maxDuration = 60;

const MAX_BODY_BYTES = 2000;

const headers = { "cache-control": "no-store" };

const notFound = () => NextResponse.json({ error: "not found" }, { status: 404, headers });

const forward = async (token: string, method: string, pathAndQuery: string, body?: string) => {
  try {
    const { status, json } = await relayFetch(token, method, pathAndQuery, body);
    return NextResponse.json(json, { status, headers });
  } catch {
    return NextResponse.json({ error: RELAY_OFFLINE }, { status: 503, headers });
  }
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  if (action !== "index" && action !== "report") return notFound();

  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  const { search } = new URL(request.url);
  return forward(gate.session.accessToken, "GET", `/v1/eod/${action}${search}`);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  if (action !== "generate") return notFound();

  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body is too large" }, { status: 413, headers });
  }
  return forward(gate.session.accessToken, "POST", "/v1/eod/generate", body);
}
