# Project Dashboard

A centralized task management dashboard for managing multiple [Lovable](https://lovable.dev) projects from a single interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## Overview

Project Dashboard provides a unified command center for tracking tasks across 9 Lovable projects. It bridges the gap between markdown-based task files (`TASKS.md`) used by AI agents and a visual web interface for human oversight.

### Managed Projects

| Project | Description |
|---------|-------------|
| ads-agency | Ad agency management platform |
| ads-launcher | Ad campaign launcher |
| aia-academy | AI Academy learning platform |
| client-dashboard | Client-facing dashboard |
| financial-presenter | Financial presentation tool |
| financial-simulator | Financial simulation engine |
| project-dashboard | This dashboard (self-managing) |
| themoneybees | Finance/investment platform |
| website-namecard-builder | Digital namecard/website builder |

## Features

### Multi-Project Overview
- Project cards with progress bars showing completion percentage
- Global stats bar: total tasks, pending, and done counts
- Real-time task count updates via auto-sync

### Task Management
- Create, edit, delete tasks with priority levels (low/medium/high)
- One-click status toggle between todo and done
- Manual task reordering (up/down)
- Separate "To Do" and "Completed" sections

### TASKS.md Sync (Two-Way)
- Automatically parses `TASKS.md` files from each project on load
- Supports markdown checkboxes, tags (`[PLAN]`, `[AUTO]`, etc.), bold titles, and indented sub-items
- Merges parsed tasks into dashboard without duplicates (matched by title)
- Checking a task done in the dashboard updates the `TASKS.md` checkbox

### Filtering & Sorting
- Filter by status (todo/done) or source (manual/tasks.md)
- Sort by: custom order, priority, status, date, or source

### Documentation Viewer
- View each project's `CLAUDE.md` and other `.md` files
- Expandable docs panel on the project detail page

### AI Agent Compatible
- `tasks.json` files are readable/writable by any AI agent
- Refresh button reflects external file changes
- Designed for human + AI collaborative workflows

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd project-dashboard

# Install dependencies
npm install
```

### Development

```bash
# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Architecture

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── page.tsx            # Dashboard home — project grid
│   ├── project/[name]/     # Project detail page
│   └── api/                # RESTful file I/O endpoints
├── components/             # React UI components
└── lib/                    # Shared logic (types, file I/O, parser)
```

### Data Flow

1. **On dashboard load** → `POST /api/sync-all` syncs all projects' `TASKS.md`
2. **On project open** → `POST /api/projects/[name]/sync` syncs that project
3. **Task CRUD** → `GET/POST/PUT/DELETE /api/projects/[name]/tasks`
4. **Status toggle** → Updates `tasks.json` AND `TASKS.md` checkbox

### Storage

No database — all data is stored as `tasks.json` files in each project directory. This keeps data co-located with the projects and accessible to AI agents.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects with task counts |
| POST | `/api/sync-all` | Sync TASKS.md for all projects |
| GET | `/api/projects/[name]/tasks` | Get tasks for a project |
| POST | `/api/projects/[name]/tasks` | Create a new task |
| PUT | `/api/projects/[name]/tasks` | Update a task |
| DELETE | `/api/projects/[name]/tasks?id=` | Delete a task |
| POST | `/api/projects/[name]/sync` | Sync single project's TASKS.md |
| POST | `/api/projects/[name]/reorder` | Reorder tasks (up/down) |
| GET | `/api/projects/[name]/docs` | Get CLAUDE.md and .md file list |

## Tech Stack

- **Next.js 16** — App Router, API routes, server-side rendering
- **React 19** — UI components with hooks
- **TypeScript 5** — Strict mode, full type safety
- **Tailwind CSS 4** — Utility-first styling, custom dark theme
- **lucide-react** — Icon library
- **clsx** — Conditional class names
- **uuid** — Task ID generation

## License

Private project — not for redistribution.
