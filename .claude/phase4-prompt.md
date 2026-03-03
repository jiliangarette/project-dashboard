# Phase 4: Changelog Tab (THE CORE FEATURE)

This is the most important feature in the entire product.

## CONCEPT

The changelog takes raw commit history from GitHub and rewrites it into plain English that anyone can understand. Commits are grouped by day.

## FETCH COMMITS

Create lib/changelog.ts:
1. Fetch commit history for a repo from GitHub API
2. Paginate (get at least 90 days of history, or configurable)
3. Group commits by date (using commit.author.date)
4. Skip merge commits with no meaningful message
5. Handle rate limits gracefully

## AI REWRITING

For each day's group of commits, send them to Anthropic's API to generate:

1. **Daily summary paragraph** (1-2 sentences, casual tone)
   Examples:
   - "Mostly focused on the campaign builder today — added the multi-account selector and squashed a couple edge cases."
   - "Quiet day. Just a small fix for a layout bug on mobile."
   - "Big push on the onboarding flow. Reworked how new users set up their first project from scratch."

2. **Bullet points** — individual changes rewritten in plain English

### WRITING RULES (enforce these in the AI prompt):
1. Write for a non-technical reader — no jargon, no file names, no function names
2. Sound human — casual but confident, not robotic
3. No emoji anywhere
4. Each bullet: 1-2 sentences explaining the change from user/product perspective
5. If multiple commits are related, combine into one bullet
6. Skip meaningless commits: "fix typo", "merge branch", "update package-lock.json", "lint fix"
7. Skip merge commits with no meaningful description
8. Daily summary captures overall vibe, doesn't just repeat bullets

### API ROUTE

Create /api/changelog/generate route that:
- Accepts: repo owner, repo name, date, commits for that day
- Sends to Anthropic API (use CLAUDE_API_KEY from env)
- Returns: { summary: string, bullets: string[] }
- Model: claude-sonnet-4-5 (fast and good enough for this)

## CACHING

- Cache generated changelogs in localStorage keyed by `changelog:owner/repo:YYYY-MM-DD`
- On page load, show cached entries immediately
- Only generate for days that aren't cached yet
- "Regenerate" button per day to re-generate and replace cache

## UI

The Changelog tab shows:
- A "Generate Changelog" button at the top (triggers generation for uncached days)
- Auto-generate on first visit if nothing cached
- Days listed in reverse chronological order (newest first)
- Each day shows:
  - Date header (e.g., "Monday, March 3, 2026")
  - Summary paragraph (slightly larger, italicized or styled differently)
  - Bullet points below
  - Small "Regenerate" button per day
- Loading state per day while generating (spinner + "Generating...")
- If no commits for a day, skip it (don't show empty days)

## RATE LIMIT HANDLING

- Show remaining GitHub API calls somewhere subtle
- If rate limited, show clear message: "GitHub API rate limit reached. Try again in X minutes."
- For Anthropic API: handle 429 errors, retry with backoff

## COMMIT

When done, commit with: "feat: AI-powered changelog that rewrites commits into plain English"
Push to origin main.

## IMPORTANT
- Use Anthropic API via fetch in an API route (not client-side)
- The CLAUDE_API_KEY is already in the .env file
- Keep the writing quality HIGH — this is the core product
- Test the prompt to make sure output follows the writing rules
