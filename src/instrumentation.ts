/**
 * Instrumentation file - runs once at server startup
 * Used for environment validation, monitoring setup, etc.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Validate environment variables at startup
    // This will throw and prevent server start if config is invalid
    await import('./lib/env');
  }
}
