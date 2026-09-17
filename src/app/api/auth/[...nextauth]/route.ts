import { NextRequest } from "next/server";
import { handlers } from "@/auth";

// GitHub returns an `iss` parameter on the OAuth callback (RFC 9207). Auth.js
// has no issuer configured for a plain OAuth 2.0 provider, so it compares that
// value against its placeholder `https://authjs.dev`, throws CallbackRouteError,
// and sends every new sign-in to "Server error". PKCE still protects the code,
// so the parameter is dropped before validation sees it.
const withoutIss = (request: NextRequest) => {
  const url = new URL(request.url);
  const iss = url.searchParams.get("iss");
  if (!iss) return request;
  console.log(`auth: dropped iss=${iss} from ${url.pathname}`);
  url.searchParams.delete("iss");
  return new NextRequest(url, { method: request.method, headers: request.headers });
};

export const GET = (request: NextRequest) => handlers.GET(withoutIss(request));
export const POST = handlers.POST;
