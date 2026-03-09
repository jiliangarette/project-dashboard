/**
 * Instrumentation file - runs once at server startup
 * Used for environment validation, monitoring setup, etc.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry for server-side (only if DSN is configured)
    const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.init({
          dsn: sentryDsn,
          tracesSampleRate: 1.0,
          debug: false,
          ignoreErrors: [
            'ECONNREFUSED',
            'ETIMEDOUT',
            'API rate limit exceeded',
          ],
          environment: process.env.NODE_ENV,
          enabled: process.env.NODE_ENV === 'production',
          beforeSend(event) {
            if (process.env.NODE_ENV !== 'production') {
              return null;
            }
            return event;
          },
        });
      } catch (e) {
        console.warn('Sentry initialization failed:', e);
      }
    }

    // Validate environment variables at startup (warns, doesn't crash)
    try {
      await import('./lib/env');
    } catch (e) {
      console.warn('Environment validation failed:', e);
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.init({
          dsn: sentryDsn,
          tracesSampleRate: 1.0,
          debug: false,
          environment: process.env.NODE_ENV,
          enabled: process.env.NODE_ENV === 'production',
        });
      } catch (e) {
        console.warn('Sentry edge initialization failed:', e);
      }
    }
  }
}

export async function onRequestError(
  err: Error,
  request: {
    method: string;
    url: string;
    headers: Headers;
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
  }
) {
  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureException(err, {
      contexts: {
        nextjs: {
          request: {
            method: request.method,
            url: request.url,
          },
          router: context,
        },
      },
    });
  } catch {
    // Sentry not available, silently ignore
  }
}
