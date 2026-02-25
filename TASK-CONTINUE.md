# Dashboard Improvements - Round 2

The dev server is running at localhost:3000. Make these changes:

## 1. Remove Assignee Feature Entirely
- Remove assignee from Task type/schema
- Remove assignee filter from TaskFilters
- Remove AssigneeBadge component
- Remove assignee field from TaskForm
- Remove assignee from TaskCard display
- Remove assignee from API routes
- Clean up any references

## 2. Auto-Parse TASKS.md on Load
When the dashboard loads or a project is opened, automatically call the sync API to parse TASKS.md files.
The TASKS.md format across projects uses:
- `- [ ]` for unchecked (todo) and `- [x]` for done
- Tags in brackets like `[PLAN]`, `[TEST]`, `[AUTO]`, `[AUTO-DB]`, `[BLOCKED]` — preserve these in the task title
- Bold text after tags is the task title: e.g. `**P6: Advantage+ audience toggle**`
- Text after the bold title (after `—` or `–`) is the description
- `###` headers are categories/groups
- Some tasks have numbered sub-items (indented lists) — include those in the description
- Tasks can have multi-line descriptions with indented content

Update the tasks-parser.ts to handle this format properly.

## 3. Add Manual Reorder (Drag-and-Drop or Move Up/Down)
- Tasks should be orderable — top of list = first to implement
- Add an `order` field to the task schema (number, lower = higher priority)
- Either drag-and-drop OR up/down arrow buttons on each task
- Persist order in tasks.json
- New tasks from TASKS.md sync get appended at the bottom (highest order number)

## 4. Auto-Sync on Project Open
When navigating to a project detail page, automatically trigger TASKS.md sync before displaying tasks.
Show a brief loading state while syncing.

## Technical Notes:
- The server is already running on localhost:3000, so you can test changes live
- Use "C:/Program Files/Git/bin/git.exe" for git commands
- Commit when done with a descriptive message
- Run npm run build to verify no errors
- Windows machine, PowerShell
