# Project Dashboard

Centralized task management dashboard for 9 Lovable projects. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Project Purpose

This is the command center for a multi-project Lovable ecosystem. It provides a unified interface to view, create, edit, and track tasks across all projects — bridging TASKS.md files (used by AI agents) with a visual web dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4 with custom dark theme
- **Icons:** lucide-react
- **Utilities:** clsx, uuid
- **Storage:** File-based JSON (tasks.json per project) — no database
- **Build:** `next build --webpack`

## Architecture

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (Header, fonts, metadata)
│   ├── page.tsx                # Main dashboard — project grid + global stats
│   ├── globals.css             # Dark theme, CSS variables, animations
│   ├── project/[name]/page.tsx # Project detail — task list, filters, CRUD
│   └── api/                    # File I/O API routes
│       ├── projects/route.ts           # GET all project summaries
│       ├── sync-all/route.ts           # POST sync TASKS.md for all projects
│       └── projects/[project]/
│           ├── tasks/route.ts          # GET/POST/PUT/DELETE tasks
│           ├── sync/route.ts           # POST sync single project
│           ├── reorder/route.ts        # POST reorder tasks
│           └── docs/route.ts           # GET CLAUDE.md and .md files
├── components/                 # React components
│   ├── Header.tsx              # Sticky top nav
│   ├── ProjectCard.tsx         # Project summary with progress bar
│   ├── TaskCard.tsx            # Task item with checkbox, actions
│   ├── TaskCheckbox.tsx        # Animated checkbox with sync feedback
│   ├── TaskForm.tsx            # Modal form for create/edit
│   ├── TaskFilters.tsx         # Filter chips (status, source, sort)
│   ├── DocsViewer.tsx          # Expandable docs panel
│   ├── PriorityBadge.tsx       # Priority label (low/medium/high)
│   └── StatusBadge.tsx         # Status label (todo/done)
└── lib/                        # Shared logic
    ├── types.ts                # TypeScript interfaces (Task, ProjectData, etc.)
    ├── constants.ts            # BASE_PATH, PROJECT_NAMES, path helpers
    ├── file-io.ts              # Async file read/write operations
    └── tasks-parser.ts         # TASKS.md parser, merge, two-way sync
```

## Managed Projects

All projects live under `~/OneDrive/Desktop/Lovable-Projects/` (resolved via `os.homedir()`):
ads-agency, ads-launcher, aia-academy, client-dashboard, financial-presenter, financial-simulator, project-dashboard, themoneybees, website-namecard-builder

## Data Model

```typescript
Task {
  id: string           // UUID
  title: string
  description?: string
  status: "todo" | "done"
  priority: "low" | "medium" | "high"
  order?: number       // Lower = higher in list
  source: "manual" | "tasks.md"
  sourceRef?: string
  createdAt: string    // ISO date
  updatedAt: string    // ISO date
  completedNote?: string
}
```

Storage: `tasks.json` in each project directory, wrapped in `{ projectName, lastSynced, tasks[] }`.

## Key Behaviors

- **Auto-sync on load:** Dashboard syncs TASKS.md for all projects on page load
- **Two-way sync:** Checking a task in the dashboard updates the TASKS.md checkbox
- **Merge without duplicates:** Parser matches tasks by title (case-insensitive)
- **Task ordering:** Manual reorder with up/down arrows, persisted in tasks.json
- **Sections:** Project view splits into "To Do" and "Completed" (collapsible)

## Development

```bash
npm run dev       # Start dev server on localhost:3000
npm run build     # Production build (uses --webpack flag)
npm run lint      # ESLint
```

## Coding Conventions

- Path alias: `@/*` → `./src/*`
- All file I/O goes through `src/lib/file-io.ts` — never use fs directly in routes
- API routes return JSON with proper error status codes
- Components use Tailwind utility classes — no CSS modules
- Dark theme by default — all colors via CSS custom properties in globals.css
- Prefer `clsx()` for conditional class names
- No external UI library (no shadcn) — custom components only
- Keep components focused: one component per file, one responsibility
- Git: use `"C:/Program Files/Git/bin/git.exe"` on this Windows machine

## Testing

No test framework configured yet. Verify changes with `npm run build`.

## Common Pitfalls

- TASKS.md formats vary across projects — the parser handles tags like `[PLAN]`, `[AUTO]`, bold titles, and indented sub-items
- File paths use Windows backslashes internally (`path.join` handles this)
- The `order` field determines task position only when sorted by "order"
- `source: "tasks.md"` tasks originate from parsing; `source: "manual"` are user-created
