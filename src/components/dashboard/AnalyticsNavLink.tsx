'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

/**
 * Nav link to the Analytics Dashboard view. Add to admin.components.afterNavLinks.
 */
export default function AnalyticsNavLink() {
  const { config } = useConfig()
  const basePath = config?.routes?.admin ?? '/admin'

  return (
    <Link
      href={`${basePath}/analytics-dashboard`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--base)',
        padding: 'var(--base)',
        color: 'var(--theme-elevation-800)',
        textDecoration: 'none',
        borderRadius: 'var(--border-radius-m)',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
      Analytics Dashboard
    </Link>
  )
}
