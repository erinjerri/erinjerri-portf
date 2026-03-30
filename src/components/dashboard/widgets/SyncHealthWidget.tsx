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
    <div
      className="card"
      style={{
        boxSizing: 'border-box',
        display: 'grid',
        gap: 'var(--base)',
        maxWidth: '100%',
        padding: 'var(--base)',
        width: '100%',
      }}
    >
      <div>
        <h3 style={{ color: 'var(--theme-text)', margin: 0 }}>{title}</h3>
        <p style={{ color: 'var(--theme-elevation-700)', margin: '0.35rem 0 0', fontSize: '0.875rem' }}>
          Env readiness, snapshot freshness, and setup links — full detail in the grid below.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          alignItems: 'stretch',
        }}
      >
        {rows.map((row) => (
          <div
            key={row.provider}
            style={{
              background: 'var(--theme-elevation-50)',
              border: '1px solid var(--theme-elevation-100)',
              borderRadius: 'var(--border-radius-m)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              minHeight: 0,
              padding: '0.875rem 1rem',
            }}
          >
            <div
              style={{
                alignItems: 'flex-start',
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'space-between',
              }}
            >
              <strong style={{ color: 'var(--theme-text)', fontSize: '0.9375rem', lineHeight: 1.3 }}>
                {row.label}
              </strong>
              <span
                style={{
                  color:
                    row.syncMode === 'manual'
                      ? 'var(--theme-warning-500)'
                      : row.isConfigured
                        ? 'var(--theme-success-500)'
                        : 'var(--theme-error-500)',
                  flexShrink: 0,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                  textAlign: 'right',
                  textTransform: 'uppercase',
                }}
              >
                {row.syncMode === 'manual'
                  ? 'Manual'
                  : row.isConfigured
                    ? 'Ready'
                    : 'Incomplete'}
              </span>
            </div>

            <p
              style={{
                color: 'var(--theme-elevation-800)',
                flex: 1,
                fontSize: '0.8125rem',
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              {row.summary}
            </p>

            <div
              style={{
                borderTop: '1px solid var(--theme-elevation-100)',
                color: 'var(--theme-elevation-700)',
                display: 'grid',
                fontSize: '0.8125rem',
                gap: '0.35rem',
                paddingTop: '0.5rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--theme-elevation-600)' }}>Latest snapshot: </span>
                {formatSnapshotDate(row.latestSnapshot)}
              </div>
              <div>
                <span style={{ color: 'var(--theme-elevation-600)' }}>Sync: </span>
                {row.syncMode === 'manual' ? 'Manual tracking (no API sync)' : 'API-backed sync'}
              </div>
              {row.missingEnvVars.length > 0 ? (
                <div style={{ wordBreak: 'break-word' }}>
                  <span style={{ color: 'var(--theme-elevation-600)' }}>Missing env: </span>
                  {row.missingEnvVars.join(', ')}
                </div>
              ) : (
                <div style={{ color: 'var(--theme-success-500)' }}>All required env vars present</div>
              )}
            </div>

            <a
              href={row.setupURL}
              rel="noopener noreferrer"
              style={{
                color: 'var(--theme-success-500)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginTop: 'auto',
                paddingTop: '0.25rem',
              }}
              target="_blank"
            >
              Setup documentation →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
