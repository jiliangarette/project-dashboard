# Phase 6: Polish

## LOADING STATES
- Every page/component that fetches data should have a loading skeleton or spinner
- No blank screens ever
- Dashboard: skeleton cards while repos load
- Project detail: skeleton header while repo info loads
- Changelog: per-day loading indicator while generating
- Tasks: subtle loading while fetching TASKS.md

## RESPONSIVE
- Dashboard grid: 1 col mobile, 2 tablet, 3 desktop
- Project detail: full width on mobile, centered max-width on desktop
- Tabs: horizontal scroll if needed on mobile
- Cards: stack vertically on mobile

## KEYBOARD SHORTCUTS
- `/` or `Cmd+K` → focus search on dashboard
- `Escape` → close modals, clear search
- `1` and `2` → switch between Changelog and Tasks tabs on project detail
- Show a small "?" shortcut hint somewhere

## ERROR HANDLING
- GitHub API errors → friendly message with retry button
- Network errors → "You appear to be offline" message
- 404 repo → "Repository not found" with back button
- Auth expired → redirect to login with message
- Never show raw error messages or stack traces

## SETTINGS
- Simple settings page or modal accessible from Header
- Options:
  - Changelog generation preferences (how many days to generate by default)
  - Clear cached changelogs
  - Clear pinned projects
  - Sign out

## README
Rewrite README.md from scratch:
- What the product is (plain English, matches the product tone)
- How to set it up (env vars, GitHub OAuth app registration, install, run)
- How it works (brief)
- Tech stack
- Screenshots section (placeholder for now)

## FINAL CLEANUP
- Remove any unused imports
- Remove any unused components or files from the old system
- Make sure `npm run build` passes with no errors
- Check for console.log statements and remove them
- Verify all TypeScript types are correct (no `any` unless absolutely necessary)

## COMMIT

When done, commit with: "feat: polish — loading states, responsive, keyboard shortcuts, error handling, settings, README"
Push to origin main.
