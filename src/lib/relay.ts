import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { OFFLINE_MESSAGE } from "@/lib/ai";

export const RELAY_OFFLINE = OFFLINE_MESSAGE;

const VARIABLE_URL =
  "https://api.github.com/repos/jiliangarette/project-dashboard/actions/variables/JARVIS_RELAY_URL";
const URL_TTL_MS = 30000;
const DEFAULT_TIMEOUT_MS = 20000;
const LOOKUP_TIMEOUT_MS = 8000;
const PROBE_TIMEOUT_MS = 5000;
const PROBE_TTL_MS = 15000;
const RELAY_HOST = /^https:\/\/[a-z0-9-]+\.(lhr\.life|trycloudflare\.com)$/;

export type RelayJson = Record<string, unknown>;
export type OwnerSession = Session & { accessToken: string };

type RelayResult<K> = K extends "text"
  ? { status: number; text: string }
  : { status: number; json: RelayJson };

interface RelayOptions<K> {
  timeoutMs?: number;
  as?: K;
}

let cachedUrl: { url: string; at: number } | null = null;
let probedUrl: { url: string; at: number } | null = null;

export const requireOwner = async (): Promise<{ session: OwnerSession } | NextResponse> => {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }
  const owner = (process.env.JARVIS_RELAY_OWNER || "jiliangarette").trim().toLowerCase();
  if (session.githubUsername?.toLowerCase() !== owner) {
    return NextResponse.json({ error: "Jarvis only answers its owner" }, { status: 403 });
  }
  return { session: session as OwnerSession };
};

const sign = (secret: string, ts: string, method: string, pathAndQuery: string, body: string) => {
  const bodyHash = createHash("sha256").update(body).digest("hex");
  return createHmac("sha256", secret)
    .update(`${ts}\n${method}\n${pathAndQuery}\n${bodyHash}`)
    .digest("hex");
};

const responseSign = (secret: string, reqSig: string, status: number, body: Uint8Array) => {
  const bodyHash = createHash("sha256").update(body).digest("hex");
  return createHmac("sha256", secret).update(`${reqSig}\n${status}\n${bodyHash}`).digest("hex");
};

const sameSig = (got: string, want: string) => {
  if (!/^[0-9a-f]{64}$/.test(got) || got.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(got, "hex"), Buffer.from(want, "hex"));
};

const call = async (
  secret: string,
  base: string,
  method: string,
  pathAndQuery: string,
  payload: string,
  timeoutMs: number
) => {
  const target = new URL(pathAndQuery, base);
  const ts = Date.now().toString();
  const reqSig = sign(secret, ts, method, `${target.pathname}${target.search}`, payload);
  const res = await fetch(target, {
    method,
    headers: {
      "x-relay-ts": ts,
      "x-relay-sig": reqSig,
      ...(payload ? { "content-type": "application/json" } : {}),
    },
    body: method === "GET" ? undefined : payload,
    cache: "no-store",
    signal: AbortSignal.timeout(Math.max(timeoutMs, 1)),
  });
  const bytes = new Uint8Array(await res.arrayBuffer());
  return {
    status: res.status,
    contentType: res.headers.get("content-type") || "",
    text: new TextDecoder().decode(bytes),
    signed: sameSig(
      res.headers.get("x-relay-res-sig") || "",
      responseSign(secret, reqSig, res.status, bytes)
    ),
  };
};

const discoverUrl = async (token: string, fresh: boolean, signal: AbortSignal) => {
  if (!fresh && cachedUrl && Date.now() - cachedUrl.at < URL_TTL_MS) return cachedUrl.url;
  const res = await fetch(VARIABLE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "jilian-dashboard",
    },
    cache: "no-store",
    signal,
  });
  if (!res.ok) throw new Error(`relay URL lookup answered ${res.status}`);
  const data = await res.json();
  const parsed = new URL(String(data?.value ?? "").trim());
  if (!RELAY_HOST.test(parsed.origin)) throw new Error("relay URL is not a tunnel address");
  cachedUrl = { url: parsed.origin, at: Date.now() };
  return parsed.origin;
};

const parseRelayJson = (contentType: string, raw: string): RelayJson | null => {
  if (!contentType.includes("application/json")) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
};

export const relayFetch = async <K extends "json" | "text" = "json">(
  token: string,
  method: string,
  pathAndQuery: string,
  body?: unknown,
  opts: RelayOptions<K> = {}
): Promise<RelayResult<K>> => {
  const secret = process.env.JARVIS_RELAY_SECRET?.trim();
  if (!secret) {
    console.error("Jarvis relay: JARVIS_RELAY_SECRET is not set");
    throw new Error(RELAY_OFFLINE);
  }
  const verb = method.toUpperCase();
  const payload = body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body);
  const deadline = Date.now() + (opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const needsProbe = !pathAndQuery.startsWith("/v1/ping");

  for (const fresh of [false, true]) {
    const remaining = deadline - Date.now();
    if (remaining < 1000) break;
    try {
      const base = await discoverUrl(token, fresh, AbortSignal.timeout(Math.min(LOOKUP_TIMEOUT_MS, remaining)));
      const probed = probedUrl && probedUrl.url === base && Date.now() - probedUrl.at < PROBE_TTL_MS;
      if (needsProbe && !probed) {
        const ping = await call(
          secret,
          base,
          "GET",
          `/v1/ping?n=${randomUUID()}`,
          "",
          Math.min(PROBE_TIMEOUT_MS, Math.max(deadline - Date.now(), 1))
        );
        if (!ping.signed || ping.status !== 200) {
          probedUrl = null;
          console.error(`Jarvis relay: probe answered ${ping.status}${ping.signed ? "" : " unsigned"}`);
          continue;
        }
        probedUrl = { url: base, at: Date.now() };
      }
      const res = await call(secret, base, verb, pathAndQuery, payload, Math.max(deadline - Date.now(), 1));
      if (!res.signed) {
        probedUrl = null;
        console.error(`Jarvis relay: ${verb} ${pathAndQuery} answered ${res.status} unsigned`);
        continue;
      }
      if (opts.as === "text") return { status: res.status, text: res.text } as RelayResult<K>;
      const json = parseRelayJson(res.contentType, res.text);
      if (json) return { status: res.status, json } as RelayResult<K>;
      console.error(`Jarvis relay: ${verb} ${pathAndQuery} answered ${res.status} without relay JSON`);
    } catch (error) {
      console.error("Jarvis relay:", error instanceof Error ? error.message : error);
    }
  }
  throw new Error(RELAY_OFFLINE);
};
