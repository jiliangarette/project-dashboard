# Project Dashboard

Your GitHub projects, explained in plain English.

## What is this?

Project Dashboard connects to your GitHub account and shows you what's been happening across all your repositories — written in language anyone can understand.

Instead of scrolling through technical commit messages like "fix onClick handler in Button.tsx", you get casual summaries like:

> "Mostly focused on the campaign builder today — added the multi-account selector and squashed a couple edge cases."

Raw commits → readable changelog. Automatically.

## Features

### 📊 Dashboard Home
- See all your GitHub repositories at a glance
- Stats: total repos, active projects (last 30 days), stars, open issues
- Search by name or description
- Filter by programming language
- Sort by: recently updated, most stars, name, issues
- Pin your favorite projects to the top

### 📝 AI-Powered Changelogs
The killer feature. Click any project and see its commit history rewritten into plain English:

- Commits grouped by day
- AI-generated summary capturing the day's focus
- Bullet points explaining what changed and why it matters
- No jargon, no file names, no technical gibberish
- Cached locally so it doesn't regenerate every visit

Powered by Claude (Anthropic) with strict writing rules to keep it human and readable.

### ✅ Task Management
Each project has a Tasks tab:

- Reads TASKS.md from your repo (if it exists)
- Parses markdown checkboxes automatically
- Create your own tasks manually (title, description, priority)
- Mark as done with a click
- Separate sections for To Do and Completed

All manual tasks stored locally (localStorage) — no database needed.

## Setup

### 1. Prerequisites
- Node.js 20+
- A GitHub account
- An Anthropic API key (for changelog generation)

### 2. Create a GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: `Project Dashboard`
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Save the **Client ID** and generate a **Client Secret**

### 3. Get an Anthropic API Key
1. Visit https://console.anthropic.com/
2. Go to API Keys
3. Create a new key

### 4. Set Up Environment Variables
```bash
cp .env.example .env
```

Fill in your `.env`:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=run_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 5. Install and Run
```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production Deployment

When deploying (e.g., Vercel):

1. Update your GitHub OAuth App:
   - Homepage URL: `https://yourdomain.com`
   - Callback URL: `https://yourdomain.com/api/auth/callback/github`

2. Set environment variables on your platform:
   - `NEXTAUTH_URL=https://yourdomain.com`
   - Plus all the others from `.env`

3. Build:
```bash
npm run build
npm start
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Auth:** NextAuth.js with GitHub OAuth
- **AI:** Anthropic Claude (Sonnet 4.5)
- **Data:** GitHub API + localStorage (no database)

## How It Works

1. **Auth:** You sign in with GitHub. We get an access token to fetch your repos and commits.

2. **Dashboard:** Fetches all your repos via GitHub API, shows stats, lets you search/filter/pin.

3. **Changelog:** For each project:
   - Fetches commits (last 90 days) from GitHub API
   - Groups by day
   - Sends each day's commits to Claude (Anthropic API)
   - Claude rewrites them into plain English (summary + bullets)
   - Caches result in localStorage so it doesn't regenerate every time

4. **Tasks:** Fetches TASKS.md from the repo, parses it, displays with manual tasks you create. All stored locally.

## Philosophy

Commit messages are written for machines and developers. This tool translates them for humans. Think of it as a personal engineering journal that writes itself.

## License

MIT

## Credits

Built by Jilian Garette A. Abangan
