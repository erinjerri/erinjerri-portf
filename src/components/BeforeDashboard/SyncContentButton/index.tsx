'use client'

import React, { useCallback, useState } from 'react'
import { toast } from '@payloadcms/ui'

export const SyncContentButton: React.FC = () => {
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (loading) {
        toast.info('Sync already in progress.')
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/next/sync-content', {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        const text = await res.text()
        if (!res.ok) {
          throw new Error(text || 'Sync failed.')
        }
        const data = JSON.parse(text) as { medium?: { synced?: number; skipped?: number }; paragraph?: { synced?: number; skipped?: number } }
        const m = data.medium ?? {}
        const p = data.paragraph ?? {}
        toast.success(
          `Synced: Medium ${m.synced ?? 0} (${m.skipped ?? 0} skipped), Paragraph ${p.synced ?? 0} (${p.skipped ?? 0} skipped). Check Posts collection.`,
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Sync failed.')
      } finally {
        setLoading(false)
      }
    },
    [loading],
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        marginLeft: '0.5rem',
        padding: '0.25rem 0.5rem',
        fontSize: '0.875rem',
        cursor: loading ? 'wait' : 'pointer',
      }}
    >
      {loading ? 'Syncing…' : 'Sync Medium & Paragraph'}
    </button>
  )
}
