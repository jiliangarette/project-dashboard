# Project Dashboard — Tasks

## Backlog

### Infrastructure & DevOps
- [x] **Set up automated testing** — Add Jest + React Testing Library, write unit tests for parser and API routes ✅
- [x] **Add CI/CD pipeline** — GitHub Actions for build verification on push ✅
- [x] **Add error monitoring** — Integrated Sentry for production error tracking, session replay, and performance monitoring ✅
- [x] **Add environment config** — BASE_PATH env variable for subdirectory deployment ✅

### Features
- [x] **Search across all projects** — Global search bar to find repos by name/description ✅
- [x] **Bulk actions** — Select multiple repos and perform batch operations (pin/unpin) ✅
- [x] **Task notes/comments** — Add timestamped notes to individual tasks with full CRUD (backend fully integrated) ✅
- [x] **Keyboard shortcuts** — Quick navigation: /, Esc, 1/2/3 for tabs, ? for help ✅
- [x] **Dashboard analytics** — Charts showing language distribution, commit activity, repo stats ✅
- [ ] **Export/import** — Export repo data as CSV or JSON for reporting
- [ ] **Notification system** — Alert when repo changes are detected
- [ ] **Project grouping/tags** — Group repos by topic/category

### UI/UX Improvements
- [x] **Mobile touch targets** — All buttons/checkboxes meet 44px minimum for touch accessibility ✅
- [ ] **Mobile-optimized layout** — Improve responsive behavior on phones (forms, cards)
- [x] **Dark/light theme toggle** — Add theme switcher ✅
- [x] **Task due dates** — Optional due date field with overdue highlighting ✅
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
