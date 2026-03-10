import { withPayload } from '@payloadcms/next/withPayload'
import bundleAnalyzer from '@next/bundle-analyzer'

import redirects from './redirects.mjs'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const serverURLs = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_SERVER_URL,
      process.env.URL,
      process.env.DEPLOY_PRIME_URL,
      process.env.CF_PAGES_URL ? `https://${process.env.CF_PAGES_URL}` : undefined,
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined,
      process.env.__NEXT_PRIVATE_ORIGIN,
      'http://localhost:3000',
    ].filter(Boolean),
  ),
)

const r2Hosts = Array.from(
  new Set(
    [
      process.env.R2_ACCOUNT_ID
        ? `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
        : undefined,
    ]
      .concat(
        process.env.R2_PUBLIC_HOSTNAME
          ? (() => {
              const raw = process.env.R2_PUBLIC_HOSTNAME.trim()
              if (!raw) return []
              try {
                const url = raw.includes('://') ? new URL(raw) : new URL(`https://${raw}`)
                return url.hostname ? [url.hostname] : []
              } catch {
                // Fall back to stripping protocol and any path/query fragment
                const hostnameOnly = raw
                  .replace(/^https?:\/\//, '')
                  .split(/[/?#]/)[0]
                  .replace(/\/+$/, '')
                return hostnameOnly ? [hostnameOnly] : []
              }
            })()
          : [],
      )
      .filter(Boolean),
  ),
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
    ],
  },
  images: {
    // Make sure image optimization stays enabled (some wrappers/platform presets toggle this).
    unoptimized: false,
    // Prefer modern formats when the client supports them.
    formats: ['image/avif', 'image/webp'],
    // Configure image qualities used by next/image. Include lower qualities for mobile.
    qualities: [60, 70, 75, 80, 85],
    // Responsive breakpoints (helps Next generate right srcset candidates).
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1440, 1920, 2048],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256, 384],
    // Only optimize direct /media/* paths. Do NOT whitelist the Payload proxy
    // endpoint `/api/media/file/**` — allowing it causes Next.js to fetch proxied
    // media during static generation which multiplies network requests and slows builds.
    localPatterns: [
      {
        pathname: '/media/**',
      },
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: [
      ...serverURLs.map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      ...r2Hosts.map((hostname) => ({
        hostname,
        protocol: 'https',
      })),
      {
        hostname: '**.r2.dev',
        protocol: 'https',
      },
      {
        hostname: '**.r2.cloudflarestorage.com',
        protocol: 'https',
      },
      // Substack CDN — for next/image if Substack URLs are ever displayed directly
      { hostname: '**.substack.com', protocol: 'https' },
      { hostname: 'cdn.substack.com', protocol: 'https' },
      { hostname: 'substackcdn.com', protocol: 'https' },
      { hostname: 'bucketeer-*.amazonaws.com', protocol: 'https' },
    ],
  },
  webpack: (webpackConfig, { dev }) => {
    // Memory cache in dev avoids ENOENT on manifests (Next.js 15 bug) and pack cache races in synced folders
    if (dev) {
      webpackConfig.cache = { type: 'memory' }
    }
    // Replace Next.js polyfills with empty module for modern browsers (saves ~11KB, improves Lighthouse)
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '../build/polyfills/polyfill-module': false,
      'next/dist/build/polyfills/polyfill-module': false,
    }
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
}

export default withBundleAnalyzer(withPayload(nextConfig))
