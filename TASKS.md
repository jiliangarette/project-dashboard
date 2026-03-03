# Project Dashboard — Tasks

## Backlog

### Infrastructure & DevOps
- [x] **Set up automated testing** — Add Jest + React Testing Library, write unit tests for parser and API routes ✅
- [x] **Add CI/CD pipeline** — GitHub Actions for build verification on push ✅
- [ ] **Add error monitoring** — Integrate error tracking for production use (Sentry)
- [ ] **Add environment config** — Move BASE_PATH to env variable for portability

### Features
- [x] **Search across all projects** — Global search bar to find repos by name/description ✅
- [ ] **Bulk actions** — Select multiple repos and perform batch operations
- [ ] **Task notes/comments** — Add timestamped notes to individual tasks for progress tracking
- [x] **Keyboard shortcuts** — Quick navigation: /, Esc, 1/2/3 for tabs, ? for help ✅
- [x] **Dashboard analytics** — Charts showing language distribution, commit activity, repo stats ✅
- [ ] **Export/import** — Export repo data as CSV or JSON for reporting
- [ ] **Notification system** — Alert when repo changes are detected
- [ ] **Project grouping/tags** — Group repos by topic/category

### UI/UX Improvements
- [ ] **Mobile-optimized layout** — Improve touch targets and responsive behavior on phones
- [x] **Dark/light theme toggle** — Add theme switcher ✅
- [ ] **Task due dates** — Optional due date field with overdue highlighting
- [ ] **Drag-and-drop reorder** — Drag-and-drop for repo pinning and task ordering
- [x] **Toast notifications** — Show success/error feedback for actions ✅
- [ ] **Skeleton loading polish** — Improve loading skeleton fidelity to match actual content layout
- [x] **Custom 404 page** — User-friendly error page with navigation ✅
- [x] **Enhanced SEO** — OpenGraph tags, Twitter cards, structured metadata ✅

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
