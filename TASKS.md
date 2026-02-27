# Jilian Dashboard — Tasks

## Backlog

### Infrastructure & DevOps
- [ ] **Set up automated testing** — Add Jest + React Testing Library, write unit tests for parser and API routes
- [ ] **Add CI/CD pipeline** — GitHub Actions for build verification on push
- [ ] **Add error monitoring** — Integrate error tracking for production use
- [ ] **Add environment config** — Move BASE_PATH to env variable for portability

### Features
- [ ] **Search across all projects** — Global search bar to find tasks by title/description across all 9 projects
- [ ] **Bulk actions** — Select multiple tasks and mark done/delete/change priority in one action
- [ ] **Task notes/comments** — Add timestamped notes to individual tasks for progress tracking
- [ ] **Keyboard shortcuts** — Quick navigation: j/k for up/down, x to toggle done, n for new task
- [ ] **Dashboard analytics** — Charts showing task completion trends over time per project
- [ ] **Export/import** — Export task data as CSV or JSON for reporting
- [ ] **Notification system** — Alert when TASKS.md changes are detected externally
- [ ] **Project grouping/tags** — Group projects by category (finance, marketing, etc.)

### UI/UX Improvements
- [ ] **Mobile-optimized layout** — Improve touch targets and responsive behavior on phones
- [ ] **Dark/light theme toggle** — Add theme switcher (currently dark-only)
- [ ] **Task due dates** — Optional due date field with overdue highlighting
- [ ] **Drag-and-drop reorder** — Replace up/down arrows with drag-and-drop for task ordering
- [ ] **Toast notifications** — Show success/error feedback for actions (create, delete, sync)
- [ ] **Skeleton loading polish** — Improve loading skeleton fidelity to match actual content layout

### Parser Improvements
- [ ] **Handle nested task lists** — Support deeper indentation levels in TASKS.md
- [ ] **Preserve task categories** — Show category headers from TASKS.md as grouping in the UI
- [ ] **Conflict resolution UI** — Show diff when TASKS.md and tasks.json disagree on a task's state

## Completed

- [x] **Build initial dashboard** — Project list, task CRUD, TASKS.md parsing
- [x] **Remove assignee feature** — Simplified task model
- [x] **Add auto-sync on load** — Dashboard and project pages sync automatically
- [x] **Add task reordering** — Up/down arrow buttons with order persistence
- [x] **Simplify to todo/done** — Removed in-progress status
- [x] **Add global stats bar** — Total/pending/done counts on dashboard
- [x] **Add progress bars** — Visual completion percentage on project cards
- [x] **Split To Do / Completed sections** — Collapsible completed section
- [x] **Animated task checkbox** — Sync feedback with loading/confirmation states
