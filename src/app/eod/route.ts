import { NextResponse, type NextRequest } from "next/server";
import { relayFetch, requireOwner, RELAY_OFFLINE } from "@/lib/relay";

export const maxDuration = 60;

const htmlHeaders = { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" };

const smallPage = (title: string, message: string, link: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
:root{color-scheme:light dark}
body{margin:0;min-height:100vh;display:grid;place-items:center;font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:#fafafa;color:#171717}
main{max-width:28rem;padding:2rem;text-align:center}
h1{font-size:1.25rem;margin:0 0 .5rem}
p{margin:0 0 1.5rem;color:#737373}
a{display:inline-block;padding:.625rem 1.25rem;border-radius:.5rem;background:#3b82f6;color:#fff;text-decoration:none}
@media (prefers-color-scheme:dark){body{background:#0a0a0a;color:#ededed}p{color:#a3a3a3}}
</style>
</head>
<body><main><h1>${title}</h1><p>${message}</p>${link}</main></body>
</html>`;

const htmlResponse = (markup: string, status: number) =>
  new NextResponse(markup, { status, headers: htmlHeaders });

export async function GET(request: NextRequest) {
  const gate = await requireOwner();
  if (gate instanceof NextResponse) {
    if (gate.status === 401) {
      return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
    }
    return htmlResponse(
      smallPage("Not allowed", "Jarvis only answers its owner.", '<a href="/">Back to dashboard</a>'),
      403
    );
  }

  try {
    const { status, text } = await relayFetch(gate.session.accessToken, "GET", "/v1/eod/page", undefined, {
      as: "text",
    });
    if (status === 200) return htmlResponse(text, 200);
    console.error(`Jarvis relay: /v1/eod/page answered ${status}`);
  } catch {}

  return htmlResponse(smallPage("End of day", RELAY_OFFLINE, '<a href="/eod">Try again</a>'), 503);
}
