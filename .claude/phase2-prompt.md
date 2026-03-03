# Phase 2: Dashboard Home

The dashboard is now "Project Dashboard" with GitHub OAuth (Phase 1 complete).

## REMOVE OLD FILE-BASED SYSTEM

The old system read from local file paths (~/OneDrive/Desktop/Lovable-Projects/).
Remove ALL of that:
- Remove lib/constants.ts (hardcoded project paths)
- Remove lib/file-io.ts (local file I/O)
- Remove lib/tasks-parser.ts (TASKS.md parser - we'll redo this in Phase 5)
- Remove old API routes that read from local filesystem (sync, sync-all, reorder, docs)
- Remove tasks.json references
- Clean up any imports referencing removed files

## GITHUB API INTEGRATION

Create a new lib/github.ts that:
1. Uses the user's GitHub access token from the session
2. Fetches all repositories the user owns (paginated, handle 100+ repos)
3. For each repo, gets: name, description, language, updated_at, stargazers_count, open_issues_count, html_url, default_branch
4. Handles GitHub API rate limits gracefully (show remaining calls, warn when low)

## DASHBOARD PAGE (app/page.tsx)

After login, show:

### Stats Bar (top)
- Total repositories
- Active repos (updated in last 30 days)
- Total stars across all repos
- Total open issues across all repos

### Search & Filters
- Search by repo name (client-side filter, instant)
- Filter by language (dropdown from detected languages)
- Sort by: Recently updated, Most stars, Name A-Z, Most issues

### Project Cards Grid
Each card shows:
- Repo name (bold)
- Description (1-2 lines, truncated)
- Language (with colored dot matching GitHub's language colors)
- Last updated (relative: "2 hours ago", "3 days ago")
- Stars count
- Open issues count
- Click → navigates to /project/[owner]/[repo]

### Pinned Projects
- Let users pin repos to top of dashboard
- Pin/unpin via a star/pin icon on each card
- Store pinned repos in localStorage
- Pinned section appears above the main grid

### Design
- Dark theme (refine existing)
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
- Clean cards with subtle borders, hover effects
- Loading skeleton while fetching repos

## API ROUTE

Create /api/github/repos route that:
- Gets session token
- Fetches repos from GitHub API
- Returns formatted JSON
- Handles errors (401 → redirect to login, rate limit → friendly message)

## COMMIT

When done, commit with: "feat: GitHub-connected dashboard with repo cards, stats, search, and filtering"
Push to origin main.

## IMPORTANT
- All data comes from GitHub API now, NOT local files
- Keep dark theme, Tailwind CSS 4, TypeScript
- No external UI library
- Handle loading states (skeleton/spinner while fetching)
- Handle empty states (no repos, no results from search)
