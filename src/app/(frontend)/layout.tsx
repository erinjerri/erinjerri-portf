import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import React from 'react'
import { Jost, League_Spartan } from 'next/font/google'
import { Suspense } from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { AnalyticsScripts } from '@/components/AnalyticsScripts'
import { GoogleTagManagerHead, GoogleTagManagerNoScript } from '@/components/GoogleTagManager'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header as HeaderType } from '@/payload-types'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  variable: '--font-league-spartan',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let headerData: HeaderType | null = null
  const headerStartedAt = Date.now()
  const headerResult = await Promise.allSettled([getCachedGlobal('header', 1)()])

  if (headerResult[0].status === 'fulfilled') {
    headerData = headerResult[0].value as HeaderType
  } else if (process.env.NODE_ENV === 'development') {
    console.error('[Layout] Failed to fetch header:', headerResult[0].reason)
  }
  if (process.env.NODE_ENV === 'development') {
    console.log(`[layout] header ${Date.now() - headerStartedAt}ms`)
  }

  const gtmContainerId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || undefined

  return (
    <html
      className={cn(leagueSpartan.variable, jost.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        {/* Preconnect to analytics origins to reduce connection latency when scripts load */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || gtmContainerId ? (
          <link rel="preconnect" href="https://www.googletagmanager.com" />
        ) : null}
        {gtmContainerId ? <GoogleTagManagerHead containerId={gtmContainerId} /> : null}
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ? (
          <>
            <link rel="preconnect" href="https://www.clarity.ms" />
            <link rel="dns-prefetch" href="https://scripts.clarity.ms" />
          </>
        ) : null}
      </head>
      <body>
        {gtmContainerId ? <GoogleTagManagerNoScript containerId={gtmContainerId} /> : null}
        <Providers>
          <AdminBar />

          <Header data={headerData} />
          {children}
          <Suspense
            fallback={<div className="mt-auto min-h-[380px] border-t border-border bg-transparent" />}
          >
            <Footer />
          </Suspense>
        </Providers>
        <AnalyticsScripts
          measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
          clarityProjectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}
        />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
  other: {
    'facebook-domain-verification': 'e7i7sx90g844e0evm09nqf9repc7pr',
  },
}
