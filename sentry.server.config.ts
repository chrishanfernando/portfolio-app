import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    // Send errors, not console output.
    integrations: [],
    // Never capture request body (may contain user portfolio data).
    sendDefaultPii: false,
  });
}
