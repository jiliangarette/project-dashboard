# Phase 5: Tasks Tab

## TASKS FROM REPO

If the repo has a TASKS.md file:
1. Fetch it via GitHub API (GET /repos/{owner}/{repo}/contents/TASKS.md)
2. Parse markdown checkboxes: `- [ ] task` and `- [x] completed task`
3. Display as a task list with checkboxes
4. Tasks from TASKS.md are read-only (label as "from repo")

## MANUAL TASKS

Users can also create tasks manually:
- Title (required)
- Description (optional)
- Priority: low, medium, high
- Status: to-do, done

### Task CRUD:
- Create: modal form or inline input
- Toggle status: click checkbox
- Edit: click to edit inline or modal
- Delete: delete button with confirmation

### Persistence:
- Manual tasks stored in localStorage keyed by `tasks:owner/repo`
- Separate from TASKS.md tasks

## UI

The Tasks tab shows:
- "Add Task" button at top
- Two sections: "To Do" and "Completed" (collapsible)
- Each task shows: checkbox, title, priority badge, source label (repo/manual)
- Clean list design matching dark theme
- Empty state: "No tasks yet. Create one or add a TASKS.md to your repo."

## COMMIT

When done, commit with: "feat: tasks tab with TASKS.md parsing and manual task management"
Push to origin main.
