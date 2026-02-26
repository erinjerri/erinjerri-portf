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
    [process.env.R2_ACCOUNT_ID ? `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined]
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
  images: {
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
    ],
  },
  webpack: (webpackConfig, { dev }) => {
    if (dev) {
      // Avoid filesystem pack cache races under synced folders (ENOENT on *.pack.gz_)
      webpackConfig.cache = { type: 'memory' }
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
