# Setup Guide

## Prerequisites

- Node.js 20+ installed
- A GitHub account
- An Anthropic API key (for AI-powered changelogs)

## GitHub OAuth App Setup

1. **Go to GitHub Settings**
   - Visit https://github.com/settings/developers
   - Click "New OAuth App"

2. **Fill in the OAuth App form:**
   - Application name: `Project Dashboard` (or any name you prefer)
   - Homepage URL: `http://localhost:3000` (for local development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

3. **After creating the app:**
   - Copy the **Client ID**
   - Generate and copy the **Client Secret**

## Environment Variables

1. **Copy the example env file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in the .env file:**
   ```env
   GITHUB_CLIENT_ID=your_github_client_id_from_step_3
   GITHUB_CLIENT_SECRET=your_github_client_secret_from_step_3
   NEXTAUTH_SECRET=generate_a_random_string_here
   NEXTAUTH_URL=http://localhost:3000
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

3. **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Or use any random string generator.

4. **Get Anthropic API Key:**
   - Visit https://console.anthropic.com/
   - Go to API Keys section
   - Create a new API key

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

When deploying to production (e.g., Vercel):

1. Update your GitHub OAuth App:
   - Homepage URL: `https://yourdomain.com`
   - Callback URL: `https://yourdomain.com/api/auth/callback/github`

2. Update environment variables:
   - Set `NEXTAUTH_URL=https://yourdomain.com`
   - Add all other env vars to your hosting platform

3. Build and deploy:
   ```bash
   npm run build
   npm start
   ```

## Troubleshooting

### "Error: Configuration" on auth
- Check that all environment variables are set correctly
- Make sure `NEXTAUTH_SECRET` is generated and set
- Verify GitHub OAuth callback URL matches exactly

### "Rate limit exceeded" on GitHub API
- GitHub has rate limits: 60 req/hour unauthenticated, 5000/hour authenticated
- The app uses authenticated requests with your access token
- Check remaining calls in the dashboard (visible in stats bar)

### Changelog generation fails
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check Anthropic API status: https://status.anthropic.com/
- Review browser console and server logs for error details
