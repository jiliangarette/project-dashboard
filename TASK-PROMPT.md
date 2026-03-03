# Project Dashboard - Build Instructions

You are building the Project Dashboard - a project task manager for managing multiple Lovable projects.

EXISTING PROJECT: Next.js 16 + React 19 + Tailwind 4 (already initialized with node_modules)
BASE PATH for projects: ~/OneDrive/Desktop/Lovable-Projects (resolved via os.homedir())
Projects: ads-agency, ads-launcher, aia-academy, client-dashboard, financial-presenter, financial-simulator, project-dashboard, themoneybees, website-namecard-builder

## Architecture
- Frontend: Next.js App Router (React 19 + TypeScript + Tailwind 4)
- Backend: Next.js API routes for file I/O (read/write tasks.json, parse TASKS.md, serve CLAUDE.md)
- Data: File-based JSON storage (tasks.json in each project folder)
- No external database

## Features to Build:

### 1. Project List View (Main Page)
- Show all 9 projects as cards/tiles
- Each card: project name, pending task count, last updated date
- Auto-detect project folders from base directory
- Clean dark-mode UI

### 2. Project Detail View
- Click project -> opens task list
- Each task has: title, description (optional), status (todo/in-progress/done), priority (low/medium/high), created/updated dates, source label (manual/tasks.md)

### 3. Task Management
- Add, edit, delete tasks
- Sort by priority, status, date, source
- Filter by assignee and source
- One-click status change (todo -> in-progress -> done)

### 4. TASKS.md Parsing and Sync (CRITICAL)
- On load/refresh: scan each project's TASKS.md
- Parse markdown task formats:
  - [ ] unchecked -> todo
  - [x] checked -> done
  - ### headers -> task category/group
  - Bullets under TODO/Tasks headings -> todo
- Merge into tasks.json (don't duplicate, match by title)
- Default source: tasks.md for imported tasks
- Optional two-way sync: marking done in dashboard updates TASKS.md checkbox

### 5. CLAUDE.md Awareness
- Collapsible Project Context panel showing CLAUDE.md contents
- List other .md files in project root as viewable docs

### 6. Data Storage (tasks.json per project)
Schema per task:
- id: uuid string
- title: string
- description: string (optional)
- status: todo or in-progress or done
- priority: low or medium or high
- source: manual or tasks.md
- source: manual or tasks.md
- sourceRef: string (e.g. line number)
- createdAt: ISO date
- updatedAt: ISO date
- completedNote: string (optional)

Wrapper:
- projectName: string
- lastSynced: ISO date
- tasks: array of task objects

### 7. AI Agent Workflow Support
- tasks.json readable/writable by any AI agent
- Refresh button to reflect external file changes
- Filter by assignee for agent-specific task views

### 8. UI/UX Requirements
- Dark mode, clean, minimal
- Responsive
- Tailwind CSS
- shadcn/ui components (install if needed)
- Smooth transitions between views

## IMPORTANT:
- Install any needed dependencies (uuid, shadcn/ui, etc)
- Create ALL API routes needed for file I/O
- Make it fully functional end-to-end
- Commit progress with descriptive messages using: "C:/Program Files/Git/bin/git.exe" add -A && "C:/Program Files/Git/bin/git.exe" commit -m "message"
- Test that the build works: npm run build
- When completely finished, run: openclaw system event --text "Done: Built Project Dashboard" --mode now
