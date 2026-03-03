/**
 * Client-side instrumentation
 * Runs once on the client when the app loads
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  tracesSampleRate: 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  debug: false,
  
  // Filter out common noise
  ignoreErrors: [
    // Browser extensions
    /chrome-extension/,
    /moz-extension/,
    // Network errors that we can't control
    'NetworkError',
    'Failed to fetch',
    // User cancellations
    'AbortError',
    'The operation was aborted',
  ],
  
  environment: process.env.NODE_ENV,
  
  enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  beforeSend(event, hint) {
    // Filter out events from localhost in development
    if (event.request?.url?.includes('localhost')) {
      return null;
    }
    return event;
  },
});

// Instrument navigation transitions for performance tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
