'use client'

import React, { useEffect, useState } from 'react'

/**
 * Visible admin log out — lives under `afterNavLinks` next to Analytics.
 * Uses REST logout so it works even if the default account menu is missing or off-screen.
 */
export default function AdminLogoutNavLink() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--base)',
    padding: 'var(--base)',
    borderRadius: 'var(--border-radius-m)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    font: 'inherit',
  }

  const logout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    } catch {
      // Still send user to login so session UI resets
    }
    window.location.assign('/admin/login')
  }

  if (!mounted) {
    return (
      <div style={{ ...baseStyle, color: 'var(--theme-elevation-500)' }}>
        <span>Log out</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      style={{
        ...baseStyle,
        color: 'var(--theme-elevation-800)',
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
        aria-hidden
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </svg>
      Log out
    </button>
  )
}
