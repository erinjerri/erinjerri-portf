import type { WidgetServerProps } from 'payload'

import React from 'react'

import { analyticsProviderDefinitions, getAnalyticsProviderConnectionState } from '@/utilities/analytics/providers'
import { findLatestSnapshotDateForProvider, formatSnapshotDate } from '@/utilities/analytics/dashboard'

type SyncHealthWidgetData = {
  data?: {
    title?: string
  }
}

export default async function SyncHealthWidget({
  req,
  widgetData,
}: WidgetServerProps<SyncHealthWidgetData>) {
  const title = widgetData?.title ?? 'Analytics Connection Health'

  const rows = await Promise.all(
    analyticsProviderDefinitions.map(async (definition) => {
      const connection = getAnalyticsProviderConnectionState(definition)
      const latestSnapshot = await findLatestSnapshotDateForProvider({
        provider: definition.provider,
        req,
      })

      return {
        ...connection,
        latestSnapshot,
      }
    }),
  )

  return (
    <div className="card" style={{ display: 'grid', gap: 'var(--base)', padding: 'var(--base)' }}>
      <div>
        <h3 style={{ color: 'var(--theme-text)', margin: 0 }}>{title}</h3>
        <p style={{ color: 'var(--theme-elevation-700)', margin: '0.35rem 0 0' }}>
          Track which providers are ready, which still need keys, and when each last wrote data.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {rows.map((row) => (
          <div
            key={row.provider}
            style={{
              background: 'var(--theme-elevation-50)',
              borderRadius: 'var(--border-radius-m)',
              padding: '0.875rem',
            }}
          >
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'space-between',
                marginBottom: '0.35rem',
              }}
            >
              <strong style={{ color: 'var(--theme-text)' }}>{row.label}</strong>
              <span
                style={{
                  color:
                    row.syncMode === 'manual'
                      ? 'var(--theme-warning-500)'
                      : row.isConfigured
                        ? 'var(--theme-success-500)'
                        : 'var(--theme-error-500)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                {row.syncMode === 'manual'
                  ? 'Manual tracking'
                  : row.isConfigured
                    ? 'Configured'
                    : 'Missing env vars'}
              </span>
            </div>
            <div style={{ color: 'var(--theme-elevation-800)', fontSize: '0.875rem' }}>{row.summary}</div>
            <div style={{ color: 'var(--theme-elevation-700)', fontSize: '0.8125rem', marginTop: '0.35rem' }}>
              Latest snapshot: {formatSnapshotDate(row.latestSnapshot)}
            </div>
            {row.missingEnvVars.length > 0 ? (
              <div style={{ color: 'var(--theme-elevation-700)', fontSize: '0.8125rem', marginTop: '0.35rem' }}>
                Missing: {row.missingEnvVars.join(', ')}
              </div>
            ) : null}
            <a
              href={row.setupURL}
              rel="noopener noreferrer"
              style={{ color: 'var(--theme-success-500)', display: 'inline-block', marginTop: '0.5rem' }}
              target="_blank"
            >
              Setup docs
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
