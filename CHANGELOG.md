# Changelog

All notable changes to **Project Dashboard** are documented in this file.

---

## [0.7.0] — 2026-03-04 — Visual Analytics & UX Refinements

### Added
- **Dark/light theme toggle** — uses `next-themes` with system preference detection, persists in localStorage
- **Keyboard shortcuts modal** — press `?` from anywhere to see all available shortcuts
- **Commit activity heatmap** — GitHub-style 12-week contribution grid on project detail pages, with streak counter and weekly stats
- **README tab** — renders repository README.md directly in the dashboard with basic markdown formatting
- **Language distribution chart** — stacked bar chart on main dashboard showing language usage across all repos
- **Top loading bar** — thin animated progress indicator during page navigation
- **Footer** — source link and keyboard shortcut hint
- **Security headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy via Next.js config
- **Image domain config** — GitHub avatar URLs whitelisted for Next.js Image optimization

---

## [0.6.0] — 2026-03-04 — Polish & Production Readiness

### Added
- **Keyboard shortcuts** for common actions (navigation, search focus, task creation)
- **Demo mode** — full dashboard experience without GitHub OAuth, including universal `/demo` route
- **Settings page** — dynamic AI provider selection (Anthropic, OpenRouter, OpenAI)
- **Responsive design** improvements across all breakpoints
- **Error boundary** for graceful render-error recovery
- **Supabase integration** scaffolding for persistent storage
- `.env.production.example` with all required environment variables

### Fixed
- Auto-redirect logic removed; login page always shown first
- OAuth error handling improved — errors redirect to demo mode
- Collaborator and org repos now included in dashboard
- Build errors and responsive polish in final pass

---

## [0.5.0] — 2026-03-03 — Tasks Tab

### Added
- **Tasks tab** on project detail page
- TASKS.md parser — reads task files from each Lovable project
- Manual task creation, editing, and deletion
- Task status toggling (todo/done) with two-way TASKS.md sync
- Priority badges and status badges

---

## [0.4.0] — 2026-03-02 — AI-Powered Changelog

### Added
- **Changelog tab** on project detail page
- Git commit history grouped by day
- AI-generated plain-English summaries of commits
- Multi-provider support: Claude (Anthropic), OpenRouter (Llama 3.1 8B Free), OpenAI (GPT-4o-mini)
- Provider switching via Settings page

---

## [0.3.0] — 2026-03-01 — Project Detail Page

### Added
- **Project detail page** (`/project/[name]`)
- Repository header with description, language, stars, forks
- Tab navigation (Overview, Changelog, Tasks)
- Back-to-dashboard navigation

---

## [0.2.0] — 2026-02-28 — GitHub Dashboard

### Added
- **GitHub-connected dashboard** replacing local-only project grid
- Repository cards with language, stars, forks, last-updated metadata
- Global stats bar (total repos, stars, languages)
- Search, filter by language, and sort (stars, updated, name)
- Pin/unpin favorite repositories
- Progress bars on project cards

---

## [0.1.0] — 2026-02-27 — Rename & GitHub OAuth

### Added
- Renamed project to **Project Dashboard**
- GitHub OAuth authentication via NextAuth.js
- Login page with GitHub sign-in button
- Auth middleware protecting dashboard routes
- Session provider wrapping the app

### Foundation (pre-auth)
- Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4
- Dark theme with custom CSS variables
- File-based JSON storage (tasks.json per project)
- TASKS.md parser with two-way sync
- Task CRUD API routes
- Project grid with summary cards
