import { NextResponse } from "next/server";
import { relayFetch, requireOwner, RELAY_OFFLINE } from "@/lib/relay";

export const maxDuration = 60;

const headers = { "cache-control": "no-store" };

export async function GET() {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) return gate;

  try {
    const { status, json } = await relayFetch(gate.session.accessToken, "GET", "/v1/ping", undefined, {
      timeoutMs: 8000,
    });
    if (status === 200 && json.ok === true) {
      return NextResponse.json({ online: true, at: json.at }, { headers });
    }
    const error =
      status === 401
        ? "Jarvis rejected the request signature. Check JARVIS_RELAY_SECRET."
        : typeof json.error === "string"
          ? json.error
          : RELAY_OFFLINE;
    return NextResponse.json({ online: false, error }, { headers });
  } catch {
    return NextResponse.json({ online: false, error: RELAY_OFFLINE }, { headers });
  }
}
