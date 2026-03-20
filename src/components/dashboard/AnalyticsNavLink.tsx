'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

/**
 * Nav link to the Analytics view. Add to admin.components.afterNavLinks.
 * Avoids useConfig to prevent "state update on unmounted component" during admin hydration.
 */
export default function AnalyticsNavLink() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--base)',
          padding: 'var(--base)',
          color: 'var(--theme-elevation-500)',
        }}
      >
        <span>Analytics</span>
      </div>
    )
  }

  return (
    <Link
      href="/admin/analytics-dashboard"
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
