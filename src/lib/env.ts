/**
 * Environment variable validation and configuration
 * 
 * Validates required environment variables at startup and provides
 * type-safe access to configuration values.
 */

interface EnvConfig {
  // GitHub OAuth
  github: {
    clientId: string;
    clientSecret: string;
  };
  
  // NextAuth
  nextAuth: {
    secret: string;
    url: string;
  };
  
  // AI Providers (optional - at least one should be configured)
  ai: {
    openrouter?: string;
    openai?: string;
    anthropic?: string;
  };
  
  // Supabase (optional - for persistent storage)
  supabase?: {
    url: string;
    key: string;
  };
  
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];
  
  // Required: GitHub OAuth
  const githubClientId = process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  
  if (!githubClientId) {
    errors.push('GITHUB_CLIENT_ID is required for GitHub OAuth');
  }
  if (!githubClientSecret) {
    errors.push('GITHUB_CLIENT_SECRET is required for GitHub OAuth');
  }
  
  // Required: NextAuth
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  if (!nextAuthSecret) {
    errors.push('NEXTAUTH_SECRET is required (generate one with: openssl rand -base64 32)');
  }
  
  // Optional: AI Providers (warn if none configured)
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  
  if (!openrouterKey && !openaiKey && !anthropicKey) {
    console.warn('⚠️  No AI provider API keys configured. Changelog generation will not work.');
    console.warn('   Configure at least one: OPENROUTER_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY');
  }
  
  // Optional: Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  
  if (supabaseUrl && !supabaseKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required when NEXT_PUBLIC_SUPABASE_URL is set');
  }
  if (supabaseKey && !supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required when NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is set');
  }
  
  // Throw if any required variables are missing
  if (errors.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${errors.map((e) => `  - ${e}`).join('\n')}\n\n` +
      `See .env.example for required configuration.`
    );
  }
  
  return {
    github: {
      clientId: githubClientId!,
      clientSecret: githubClientSecret!,
    },
    nextAuth: {
      secret: nextAuthSecret!,
      url: nextAuthUrl,
    },
    ai: {
      openrouter: openrouterKey,
      openai: openaiKey,
      anthropic: anthropicKey,
    },
    supabase: supabaseUrl && supabaseKey
      ? { url: supabaseUrl, key: supabaseKey }
      : undefined,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  };
}

// Validate and export config
// This will throw at build time if required vars are missing
export const env = validateEnv();

// Helper to check if AI providers are configured
export function hasAnyAIProvider(): boolean {
  return !!(env.ai.openrouter || env.ai.openai || env.ai.anthropic);
}

// Helper to get configured AI providers
export function getConfiguredAIProviders(): Array<'openrouter' | 'openai' | 'anthropic'> {
  const providers: Array<'openrouter' | 'openai' | 'anthropic'> = [];
  if (env.ai.openrouter) providers.push('openrouter');
  if (env.ai.openai) providers.push('openai');
  if (env.ai.anthropic) providers.push('anthropic');
  return providers;
}

// Log configuration status (development only)
if (env.isDevelopment) {
  console.log('✓ Environment configuration validated');
  console.log(`  - GitHub OAuth: configured`);
  console.log(`  - NextAuth: configured`);
  console.log(`  - AI Providers: ${getConfiguredAIProviders().join(', ') || 'none'}`);
  console.log(`  - Supabase: ${env.supabase ? 'configured' : 'not configured'}`);
}
