# Sentry Error Monitoring Setup

Sentry is integrated but **optional**. The app works fine without it — Sentry only activates in production when you provide a DSN.

## Why Sentry?

In production, errors happen. Users hit edge cases, APIs fail, browsers behave weirdly. Sentry captures all of that automatically:

- **Real-time error tracking** — see what broke, when, and for how many users
- **Stack traces** — full context including file names and line numbers
- **User sessions** — replay what the user was doing when things went wrong
- **Performance monitoring** — track slow API calls and page loads

## Quick Setup (5 minutes)

### 1. Create a Sentry Account
1. Go to [sentry.io](https://sentry.io/)
2. Sign up (free tier is generous — 5k errors/month)
3. Create a new project
   - Platform: **Next.js**
   - Alert settings: your choice (email recommended)

### 2. Get Your DSN
After creating the project, Sentry shows you a **DSN** (Data Source Name). It looks like:

```
https://abc123def456@o123456.ingest.sentry.io/7891011
```

Copy this. It's public — safe to commit (it just tells Sentry where to send errors).

### 3. Add Environment Variables

Add these to your `.env` (local) or deployment platform (production):

```env
# Required: where to send errors (public, safe to commit)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Optional: for uploading source maps (keep secret, only needed in CI/CD)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=sntrys_xxxxx
```

**Where to find these:**
- `SENTRY_ORG` and `SENTRY_PROJECT` — in your Sentry project URL: `https://sentry.io/organizations/{org}/projects/{project}/`
- `SENTRY_AUTH_TOKEN` — [Create one here](https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/) with `project:releases` and `project:write` scopes

### 4. Deploy

That's it. Deploy your app with the `NEXT_PUBLIC_SENTRY_DSN` set, and errors will start flowing to Sentry.

## Source Maps (Optional)

Source maps let Sentry show you the **actual code** that caused an error (not the minified production bundle).

To enable:
1. Set `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` in your CI/CD pipeline
2. Build the app — source maps upload automatically during `npm run build`

**Vercel users:** Add these as environment variables in your project settings. Vercel will handle uploads.

## Testing Sentry

To verify it's working:

1. Trigger an error in production (temporarily add a `throw new Error("Test")` somewhere)
2. Check your Sentry dashboard — error should appear within seconds
3. Remove the test error

## Local Development

Sentry is **disabled in development** by default (see `sentry.client.config.ts` and `sentry.server.config.ts`). No spam, no noise during dev.

To test locally:
1. Temporarily change `enabled: process.env.NODE_ENV === 'production'` to `enabled: true`
2. Restart dev server
3. Trigger an error
4. Check Sentry dashboard

## What Gets Tracked?

**Automatically:**
- Unhandled exceptions (crashes)
- Failed API calls
- React render errors
- Navigation errors

**Filtered out (noise reduction):**
- Browser extensions (`chrome-extension://`)
- Network timeouts (`Failed to fetch`, `NetworkError`)
- User cancellations (`AbortError`)
- GitHub API rate limits (expected, not errors)

See `sentry.client.config.ts` and `sentry.server.config.ts` for full filter logic.

## Session Replay

Sentry can record user sessions (DOM snapshots, not video) and replay them when errors occur. This is **enabled by default** but privacy-safe:

- 10% of normal sessions
- 100% of sessions with errors
- No form inputs or sensitive data captured

To disable: remove `replaysSessionSampleRate` and `replaysOnErrorSampleRate` from `sentry.client.config.ts`.

## Cost

Free tier (generous for side projects):
- 5,000 errors/month
- 500 replays/month
- 10,000 performance transactions/month

Paid plans start at $26/month if you need more.

## Removing Sentry

If you decide you don't need it:

1. `npm uninstall @sentry/nextjs`
2. Delete `sentry.*.config.ts` files
3. Revert `next.config.ts` to remove `withSentryConfig`
4. Remove `NEXT_PUBLIC_SENTRY_DSN` from env vars

The app works identically without it — Sentry is purely additive.

---

**Questions?** See [Sentry's Next.js docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
