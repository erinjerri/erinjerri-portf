import type { Metadata } from 'next'

import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { SiteAmbientCurvesLoader } from '@/components/SiteAmbientCurvesLoader'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { AnalyticsScripts } from '@/components/AnalyticsScripts'
import { GoogleTagManagerHead, GoogleTagManagerNoScript } from '@/components/GoogleTagManager'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import {
  CANONICAL_SITE_ORIGIN,
  PERSON_JSON_LD,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
} from '@/utilities/siteMetadata'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Footer as FooterType, Header as HeaderType } from '@/payload-types'

import './globals.css'
import { fontJost, frontendFontVariables } from './fonts'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let headerData: HeaderType | null = null
  let footerData: FooterType | null = null
  let headerFailed = false
  let footerFailed = false
  const headerStartedAt = Date.now()
  const [headerResult, footerResult] = await Promise.allSettled([
    getCachedGlobal('header', 1)(),
    getCachedGlobal('footer', 2)(),
  ])

  if (headerResult.status === 'fulfilled') {
    headerData = headerResult.value as HeaderType
  } else if (process.env.NODE_ENV === 'development') {
    headerFailed = true
    const reason =
      headerResult.reason instanceof Error
        ? `${headerResult.reason.name}: ${headerResult.reason.message}`
        : String(headerResult.reason ?? 'unknown error')
    console.warn('[Layout] Failed to fetch header:', reason)
  }
  if (footerResult.status === 'fulfilled') {
    footerData = footerResult.value as FooterType
  } else if (process.env.NODE_ENV === 'development') {
    footerFailed = true
    const reason =
      footerResult.reason instanceof Error
        ? `${footerResult.reason.name}: ${footerResult.reason.message}`
        : String(footerResult.reason ?? 'unknown error')
    console.warn('[Layout] Failed to fetch footer:', reason)
  }
  if (process.env.NODE_ENV === 'development') {
    console.log(`[layout] header ${Date.now() - headerStartedAt}ms`)
  }

  const gtmContainerId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || undefined
  const enableThirdPartyScripts = process.env.NODE_ENV === 'production'

  /** Site is dark-only — no OS / localStorage theme branching (avoids flash and keeps editorial palette). */
  const themeBootstrapScript =
    '(function(){try{document.documentElement.setAttribute("data-theme","dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();'

  return (
    <html
      className={frontendFontVariables}
      lang="en"
      suppressHydrationWarning
      data-theme="dark"
    >
      <head>
        {/* eslint-disable-next-line react/no-danger -- sync data-theme before first paint */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        {/* Preconnect to analytics origins to reduce connection latency when scripts load */}
        {enableThirdPartyScripts &&
        (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || gtmContainerId) ? (
          <link rel="preconnect" href="https://www.googletagmanager.com" />
        ) : null}
        {enableThirdPartyScripts && gtmContainerId ? (
          <GoogleTagManagerHead containerId={gtmContainerId} />
        ) : null}
        {enableThirdPartyScripts && process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ? (
          <>
            <link rel="preconnect" href="https://www.clarity.ms" />
            <link rel="dns-prefetch" href="https://scripts.clarity.ms" />
          </>
        ) : null}
      </head>
      <body className={fontJost.className}>
        {enableThirdPartyScripts && gtmContainerId ? (
          <GoogleTagManagerNoScript containerId={gtmContainerId} />
        ) : null}
        <Providers>
          <SiteAmbientCurvesLoader />
          <AdminBar />

          <Header data={headerFailed ? undefined : headerData} />
          {children}
          <Footer data={footerFailed ? undefined : footerData} />
        </Providers>
        <script
          id="person-jsonld-schema"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
        />
        {enableThirdPartyScripts ? (
          <AnalyticsScripts
            measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
            clarityProjectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}
          />
        ) : null}
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  alternates: {
    canonical: `${CANONICAL_SITE_ORIGIN}/`,
  },
  description: SITE_DEFAULT_DESCRIPTION,
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  title: SITE_DEFAULT_TITLE,
  twitter: {
    card: 'summary_large_image',
    creator: '@erinjerri',
  },
  other: {
    'facebook-domain-verification': 'e7i7sx90g844e0evm09nqf9repc7pr',
  },
}
