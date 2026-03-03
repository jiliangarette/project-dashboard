/**
 * Instrumentation file - runs once at server startup
 * Used for environment validation, monitoring setup, etc.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry for server-side
    const Sentry = await import('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
      
      ignoreErrors: [
        'ECONNREFUSED',
        'ETIMEDOUT',
        'API rate limit exceeded',
      ],
      
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === 'production' && !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
      
      beforeSend(event) {
        if (process.env.NODE_ENV !== 'production') {
          return null;
        }
        return event;
      },
    });
    
    // Validate environment variables at startup
    // This will throw and prevent server start if config is invalid
    await import('./lib/env');
  }
  
  if (process.env.NEXT_RUNTIME === 'edge') {
    // Initialize Sentry for edge runtime
    const Sentry = await import('@sentry/nextjs');
    
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    });
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
}
