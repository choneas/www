import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  './locales/request.ts'
)

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'autoplay=()'
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/tweet/:path*',
        destination: '/moment/:path*',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.notion.com"
      },
      {
        protocol: "https",
        hostname: "file.notion.com"
      },
      {
        protocol: "https",
        hostname: "file.notion.so"
      },
      {
        protocol: "https",
        hostname: "img.notionusercontent.com"
      },
      {
        protocol: "https",
        hostname: "secure.notion-static.com"
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com"
      },
      {
        protocol: "https",
        hostname: "cdn.bsky.app"
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com"
      }
    ],
    minimumCacheTTL: 86400,
    formats: ['image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    dangerouslyAllowLocalIP: true,
  },
  allowedDevOrigins: ['127.0.0.1', '192.168.*.*'],
  cacheComponents: true,
};

export default withNextIntl(nextConfig);
