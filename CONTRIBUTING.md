# Contributing to Jilian Dashboard

## Development Setup

```bash
npm install
npm run dev
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for full architecture documentation.

## Making Changes

### Frontend (Components & Pages)
1. Components live in `src/components/` — one component per file
2. Pages use Next.js App Router in `src/app/`
3. Use Tailwind CSS utilities — no CSS modules
4. Use CSS custom properties from `globals.css` for theme colors
5. Use `clsx()` for conditional class names

### Backend (API Routes & Logic)
1. API routes live in `src/app/api/`
2. All file I/O goes through `src/lib/file-io.ts`
3. Parser logic is in `src/lib/tasks-parser.ts`
4. Shared types in `src/lib/types.ts`

### Before Committing
```bash
npm run build    # Must pass — TypeScript errors will fail the build
npm run lint     # Fix any linting issues
```

## Commit Messages

Use conventional commit format:
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring without behavior change
- `docs:` — Documentation updates
- `chore:` — Maintenance tasks

## Agent Workflow

This project is designed for human + AI collaboration:
- AI agents can read/write `tasks.json` files directly
- The dashboard auto-syncs with `TASKS.md` on page load
- Use the agent definitions in `.claude/agents/` when delegating work
