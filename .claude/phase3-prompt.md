# Phase 3: Project Detail Page

## ROUTE

Create /project/[owner]/[repo]/page.tsx

## REPO HEADER

At the top of the page, show:
- Back button (← back to dashboard)
- Repo name (large)
- Description
- Language (with colored dot)
- Stars, forks, open issues counts
- Link to GitHub repo (external link icon, opens in new tab)
- Last updated date

Fetch this data from GitHub API using the owner/repo params.

## TABS

Below the header, two tabs:
1. **Changelog** (selected by default) — content will be built in Phase 4
2. **Tasks** — content will be built in Phase 5

For now:
- Build the tab UI (clickable tabs with active indicator)
- Changelog tab shows a placeholder: "Changelog will appear here"
- Tasks tab shows a placeholder: "Tasks will appear here"
- Use URL search params or state to track active tab

## DESIGN
- Dark theme consistent with dashboard
- Clean tab design (underline style or pill style)
- Responsive
- Loading state while fetching repo info
- Error state if repo not found (404)

## COMMIT

When done, commit with: "feat: project detail page with repo header and tab navigation"
Push to origin main.
