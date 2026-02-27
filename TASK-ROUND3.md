# Dashboard Improvements - Round 3

Dev server running at localhost:3000.

## 1. Simplify Task Status
- Remove all statuses except: `todo` and `done`
- No "in-progress", no "pending", no other statuses
- Task is either todo (not done) or done (complete)
- Update Task type, TaskCard, TaskForm, TaskFilters, all API routes
- One-click toggle: click to mark done, click again to mark todo

## 2. Auto-Sync ALL Projects on Dashboard Load
- When the main page loads, automatically sync TASKS.md for ALL projects that have one
- The project cards on the main page should show accurate task counts IMMEDIATELY
- Don't wait for user to click into a project
- Call the sync endpoint for each project on page load
- Projects with TASKS.md: ads-agency, aia-academy, financial-simulator, themoneybees, website-namecard-builder
- After sync, project cards should show correct pending (todo) count

## 3. Fix: Project Cards Must Show Real Task Counts
- Right now cards show "0 pending" even for projects with TASKS.md
- After auto-sync on load, re-fetch project list to get updated counts
- The /api/projects route should read tasks.json from each project to get counts

## Technical:
- Use "C:/Program Files/Git/bin/git.exe" for git
- Commit when done
- Run npm run build to verify
- Windows PowerShell
