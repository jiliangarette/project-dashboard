# Phase 1: Rename + Authentication

## RENAME

Search the ENTIRE codebase and rename every reference from the old project name to "Project Dashboard."
This includes:
- package.json (name field)
- Page titles, browser tabs, meta tags in layout.tsx
- README.md header and all references
- CLAUDE.md header and all references
- Comments in code
- Any hardcoded strings mentioning the old name
- The Header component text
- Any constants or config files

Do a thorough grep (case insensitive) and replace appropriately.
The old name should NOT appear anywhere in the codebase when you're done (except in git history obviously).

## AUTHENTICATION (GitHub OAuth)

Set up GitHub OAuth login using NextAuth.js (next-auth).

### Requirements:
1. Install next-auth and @auth/core
2. Configure GitHub OAuth provider
3. Create auth API route at /api/auth/[...nextauth]
4. Create a clean login page that shows when user is not authenticated
5. Protect all other routes - redirect to login if not authenticated
6. Show user avatar and name in the Header when logged in
7. Add a logout button in the Header
8. Store the GitHub access token in the session (we need it later for GitHub API calls)

### Login Page Design:
- Dark theme (matches existing aesthetic)
- Centered card with "Project Dashboard" title
- Brief tagline: "Your projects, explained in plain English"
- "Sign in with GitHub" button
- Clean, minimal, no clutter

### Environment Variables Needed:
Create a `.env.example` file documenting:
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET  
- NEXTAUTH_SECRET
- NEXTAUTH_URL

### If You Can't Fully Test:
Build it out completely and document in a SETUP.md file exactly what needs to be configured:
- How to register a GitHub OAuth app
- What callback URL to set
- What environment variables to fill in

## COMMIT

When done, commit with message: "feat: rename to Project Dashboard and add GitHub OAuth authentication"

Then push to origin main.

## IMPORTANT
- Keep the existing dark theme
- Keep Tailwind CSS 4 setup
- Keep the existing project structure (App Router)
- Use TypeScript throughout
- No external UI library (keep custom components)
