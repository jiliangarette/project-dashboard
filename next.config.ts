import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Support deploying to a subdirectory (e.g., /dashboard)
  // Set NEXT_PUBLIC_BASE_PATH env var to customize
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Upload source maps only if auth token is provided
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // Automatically inject Sentry config
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
};

// Export the Sentry-wrapped config
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
