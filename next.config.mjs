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
          ? process.env.R2_PUBLIC_HOSTNAME.replace(/^https?:\/\//, '').replace(/\/+$/, '')
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
    // Configure image qualities used by next/image. Next.js 16 will require explicit config.
    qualities: [80, 85],
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
