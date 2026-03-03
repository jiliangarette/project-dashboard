# Changelog

All notable changes to **Project Dashboard** are documented in this file.

---

## [0.10.0] — 2026-03-04 — Production Error Monitoring

### Added
- **Sentry integration** — Full error tracking for production (optional, only activates when DSN is provided)
- **Session replay** — Capture 10% of sessions and 100% of error sessions for debugging
- **Performance monitoring** — Track slow API calls, page loads, and navigation transitions
- **Global error handler** — Catch and report React render errors from anywhere in the app
- **Request error tracking** — Instrument Next.js `onRequestError` hook for server-side error capture
- **Automatic filtering** — Ignore browser extensions, network timeouts, and user cancellations
- **SENTRY_SETUP.md** — Complete setup guide with Vercel instructions

### Technical
- Moved Sentry initialization to `instrumentation.ts` and `instrumentation-client.ts` (Next.js 15+ recommended pattern)
- Added `global-error.tsx` for React render error boundary
- Added `onRouterTransitionStart` hook for navigation performance tracking
- Updated `.env.example` and `.env.production.example` with Sentry variables
- Wrapped `next.config.ts` with `withSentryConfig` for source map uploads

### Dependencies
- Added `@sentry/nextjs@^9` for error monitoring

---

## [0.9.0] — 2026-03-04 — Task Management Enhancements

### Added
- **Task due dates** — Optional due date field with smart date picker (min: today)
- **Overdue task highlighting** — Tasks past due date show with red border and background tint
- **Relative due date display** — Shows "overdue", "due today", "due tomorrow", or "due in X days" with color coding
- **Due date calendar icon** — Visual indicator for upcoming tasks with alert icon for overdue
- **Due Date sort option** — Added to task filter controls for sorting by due date
- **Task notes/comments (UI)** — Expandable notes section on task cards with timestamped entries
- **TaskNotes component** — Collapsible note thread with relative timestamps, add/delete functionality
- **Note timestamps** — Smart formatting (just now, Xm ago, Xh ago, Xd ago, or date)

### In Progress
- Task notes backend integration with TasksTab localStorage (UI complete, wiring pending)

### Technical
- Updated Task type to include `dueDate` and `notes` fields
- Enhanced TaskCard with due date logic and visual states
- Added TaskNotes component for note management
- Extended TaskFilters to support "dueDate" sort field

---

## [0.8.0] — 2026-03-04 — Testing, CI/CD & Production Polish

### Added
- **CI/CD pipeline** — GitHub Actions workflow for automated testing, linting, type checking, and build verification on every push and PR
- **Testing infrastructure** — Jest + React Testing Library setup with example tests for components and utilities
- **TESTING.md** — comprehensive testing guide with examples, best practices, and troubleshooting
- **Custom 404 page** — user-friendly not-found page with helpful navigation links
- **Enhanced SEO metadata** — OpenGraph tags, Twitter cards, detailed meta descriptions, and proper structured data
- **Test scripts** — `npm test`, `npm run test:watch`, `npm run test:coverage` for running tests

### Documentation
- Added `TESTING.md` with full testing guide
- Updated `package.json` with test dependencies and scripts
- Enhanced metadata in `layout.tsx` for better social sharing and SEO

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
