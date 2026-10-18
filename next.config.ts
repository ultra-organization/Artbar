import path from 'path';
import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';
const isVercelProduction = process.env.VERCEL_ENV === 'production';
const shouldEnforceCsp = isVercelProduction;

const CSP = [
  `default-src 'self'`,
  // Next.js boot scripts and JSON-LD blocks are inline. Keep inline scripts allowed for
  // static performance; only local dev needs eval for tooling.
  // The booking host serves embed.js, the auto-resize listener for the booking iframe widgets.
  // Keep painta.co temporarily for older published embed URLs.
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://booking.artbar.co.jp https://painta.co`,
  // Tailwind injects inline style attributes; Google Fonts CSS is loaded by ThemeInjector.
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `img-src 'self' data: blob: https:`,
  `media-src 'self' data: blob: https:`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `connect-src 'self' https://vitals.vercel-insights.com https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://ad.doubleclick.net https://googleads.g.doubleclick.net https://www.googleadservices.com https://www.google.com https://www.google.co.jp`,
  // Google Maps embeds on /locations and booking widgets served from Artbar's Painta tenant.
  // Keep painta.co temporarily for any older embed URLs still present in published content.
  `frame-src https://www.google.com https://maps.google.com https://www.googletagmanager.com https://booking.artbar.co.jp https://tickets.artbar.co.jp https://painta.co`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `report-uri /api/csp-report`,
  `report-to csp-endpoint`,
  ...(shouldEnforceCsp ? [`upgrade-insecure-requests`] : []),
].join('; ');

const CSP_REPORT_ENDPOINT = !process.env.VERCEL_URL
  ? `http://localhost:${process.env.PORT ?? 3000}/api/csp-report`
  : `https://${process.env.VERCEL_URL}/api/csp-report`;
const CSP_REPORT_TO = JSON.stringify({
  group: 'csp-endpoint',
  max_age: 10886400,
  endpoints: [{ url: CSP_REPORT_ENDPOINT }],
});

const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Reporting-Endpoints', value: `csp-endpoint="${CSP_REPORT_ENDPOINT}"` },
  { key: 'Report-To', value: CSP_REPORT_TO },
  { key: shouldEnforceCsp ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only', value: CSP },
];

/** Pin tracing root so a lockfile in a parent folder (e.g. ~/bun.lock) does not confuse Next. */
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  // Keep core SEO tags in the initial HTML instead of streaming them later. This is
  // friendlier to Lighthouse, social preview tools, and simpler crawlers.
  htmlLimitedBots: /.*/,
  async headers() {
    return [{ source: '/(.*)', headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return [
      {
        source: '/themes/texture-art',
        destination: '/themes/texture-painting',
        permanent: true,
      },
      {
        source: '/en/themes/texture-art',
        destination: '/en/themes/texture-painting',
        permanent: true,
      },
      {
        source: '/notification-based-on-the-specified-commercial-transactions-act',
        destination: '/specified-commercial-transactions',
        permanent: true,
      },
      {
        source: '/en/notification-based-on-the-specified-commercial-transactions-act',
        destination: '/en/specified-commercial-transactions',
        permanent: true,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'toolandtea.com' },
      { protocol: 'https', hostname: 'artbar.co.jp' },
      { protocol: 'https', hostname: 'www.artbar.co.jp' },
    ],
    // Avoid Sharp-based optimization in dev — reduces crashes on macOS (malloc / bad free) when
    // assets 404 or during heavy Fast Refresh; production builds still optimize images.
    ...(process.env.NODE_ENV === 'development' ? { unoptimized: true } : {}),
  },
};

export default nextConfig;
