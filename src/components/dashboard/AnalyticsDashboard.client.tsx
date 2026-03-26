'use client'

/**
 * Custom Payload admin analytics dashboard — client view with Recharts.
 * Placeholder metrics; wire to GA4 / analytics-snapshots when ready.
 */

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { cn } from '@/utilities/ui'

import styles from './AnalyticsDashboard.module.scss'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TrafficTab = 'visitors' | 'subscribers' | 'content'

interface DailyMetric {
  date: string
  substack: number
  direct: number
  social: number
  search: number
}

interface SourceRow {
  name: string
  value: number
  color: string
}

interface EventRow {
  date: string
  event: string
  badge: 'spike' | 'stable' | 'new'
}

interface MetricCard {
  label: string
  value: string
  delta: string
  up: boolean
}

export type AnalyticsDashboardClientProps = {
  recentPosts?: Array<{ id: string; title: string }>
}

// ---------------------------------------------------------------------------
// Mock data — replace with real fetches
// ---------------------------------------------------------------------------

const MOCK_DAILY: DailyMetric[] = [
  { date: '3/1', substack: 1, direct: 2, social: 0, search: 0 },
  { date: '3/3', substack: 1, direct: 1, social: 1, search: 0 },
  { date: '3/5', substack: 2, direct: 3, social: 1, search: 1 },
  { date: '3/7', substack: 1, direct: 2, social: 2, search: 1 },
  { date: '3/9', substack: 2, direct: 1, social: 1, search: 0 },
  { date: '3/11', substack: 3, direct: 3, social: 2, search: 1 },
  { date: '3/13', substack: 2, direct: 2, social: 1, search: 1 },
  { date: '3/15', substack: 10, direct: 4, social: 3, search: 2 },
  { date: '3/17', substack: 3, direct: 2, social: 1, search: 1 },
  { date: '3/19', substack: 2, direct: 3, social: 2, search: 1 },
  { date: '3/21', substack: 1, direct: 1, social: 1, search: 0 },
  { date: '3/23', substack: 2, direct: 3, social: 1, search: 1 },
  { date: '3/25', substack: 14, direct: 7, social: 5, search: 3 },
  { date: '3/26', substack: 8, direct: 4, social: 3, search: 2 },
]

const MOCK_SUBSCRIBER_WEEKLY = [
  { label: 'W1', newSubs: 12 },
  { label: 'W2', newSubs: 18 },
  { label: 'W3', newSubs: 9 },
  { label: 'W4', newSubs: 22 },
]

const MOCK_SOURCES: SourceRow[] = [
  { name: 'substack.com', value: 89, color: '#C9A84C' },
  { name: 'direct / none', value: 72, color: '#60a5fa' },
  { name: 'instagram', value: 48, color: '#4ade80' },
  { name: 'google search', value: 31, color: '#a78bfa' },
  { name: 'linkedin', value: 7, color: '#fb923c' },
]

const MOCK_EVENTS: EventRow[] = [
  { date: '03/25', event: 'substack post → traffic spike', badge: 'spike' },
  { date: '03/19', event: 'AI tech stack article published', badge: 'spike' },
  { date: '03/12', event: 'book page updated', badge: 'new' },
  { date: '03/07', event: 'organic baseline week', badge: 'stable' },
  { date: '03/02', event: 'substack referral · 1 unique', badge: 'stable' },
]

const MOCK_METRICS: MetricCard[] = [
  { label: 'total visitors', value: '247', delta: '↑ 18% vs prior', up: true },
  { label: 'substack refs', value: '89', delta: '↑ 34%', up: true },
  { label: 'direct', value: '72', delta: '↓ 5%', up: false },
  { label: 'avg. session', value: '2:14', delta: '↑ 12%', up: true },
]

const STREAM_LEGEND = [
  { key: 'substack', color: '#C9A84C' },
  { key: 'direct', color: '#60a5fa' },
  { key: 'social', color: '#4ade80' },
  { key: 'search', color: '#a78bfa' },
] as const

type TooltipPayloadItem = {
  dataKey?: string | number
  color?: string
  value?: number | string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className={styles.tooltipRow} style={{ color: p.color }}>
          <span>{p.dataKey}</span>
          <span>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button type="button" className={cn(active ? styles.tabButtonActive : styles.tabButton)} onClick={onClick}>
      {label}
    </button>
  )
}

function MetricCardComponent({ card }: { card: MetricCard }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>{card.label}</div>
      <div className={styles.metricValue}>{card.value}</div>
      <div className={styles.metricDelta} style={{ color: card.up ? '#4ade80' : '#f87171' }}>
        {card.delta}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className={styles.sectionLabel}>{children}</div>
}

function SourceBar({ row, max }: { row: SourceRow; max: number }) {
  const pct = Math.round((row.value / max) * 100)
  return (
    <div className={styles.sourceBar}>
      <div className={styles.sourceBarHeader}>
        <span style={{ color: 'var(--theme-elevation-500, #888)' }}>{row.name}</span>
        <span style={{ color: 'var(--theme-text, #f0ede6)' }}>{row.value}</span>
      </div>
      <div className={styles.sourceBarTrack}>
        <div className={styles.sourceBarFill} style={{ width: `${pct}%`, background: row.color }} />
      </div>
    </div>
  )
}

const BADGE_CLASS: Record<EventRow['badge'], string> = {
  spike: styles.badgeSpike,
  stable: styles.badgeStable,
  new: styles.badgeNew,
}

function EventLogRow({ row }: { row: EventRow }) {
  return (
    <div className={styles.eventRow}>
      <span className={styles.eventDate}>{row.date}</span>
      <span className={styles.eventText}>{row.event}</span>
      <span className={BADGE_CLASS[row.badge]}>{row.badge}</span>
    </div>
  )
}

export default function AnalyticsDashboardClient({ recentPosts = [] }: AnalyticsDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TrafficTab>('visitors')

  const maxSource = Math.max(...MOCK_SOURCES.map((s) => s.value))

  const chartTitle =
    activeTab === 'visitors'
      ? 'visitor streams · last 30 days'
      : activeTab === 'subscribers'
        ? 'new subscribers · weekly (sample)'
        : 'content overview'

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <div className={styles.title}>erinjerri.com · analytics</div>
          <p className={styles.subtitle}>Traffic mix, sources, and highlights — connect GA4 for live data.</p>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.liveDot} aria-hidden />
          <span>sample data · wire API when ready</span>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Analytics sections">
        <TabButton label="unique visitors" active={activeTab === 'visitors'} onClick={() => setActiveTab('visitors')} />
        <TabButton label="new subscribers" active={activeTab === 'subscribers'} onClick={() => setActiveTab('subscribers')} />
        <TabButton label="content perf" active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
      </div>

      <div className={styles.metricsGrid}>
        {MOCK_METRICS.map((m) => (
          <MetricCardComponent key={m.label} card={m} />
        ))}
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <SectionLabel>{chartTitle}</SectionLabel>
          {activeTab === 'visitors' ? (
            <div className={styles.legend}>
              {STREAM_LEGEND.map((l) => (
                <div key={l.key} className={styles.legendItem}>
                  <span className={styles.legendSwatch} style={{ background: l.color }} />
                  {l.key}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.tabPanel}>
          {activeTab === 'visitors' ? (
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_DAILY} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    {STREAM_LEGEND.map(({ key, color }) => (
                      <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.28} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#666', fontSize: 9, fontFamily: 'inherit' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fill: '#666', fontSize: 9, fontFamily: 'inherit' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {STREAM_LEGEND.map(({ key, color }) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={1.5}
                      fill={`url(#grad-${key})`}
                      dot={false}
                      activeDot={{ r: 3, fill: color }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          {activeTab === 'subscribers' ? (
            <div className={styles.chartWrapSm}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_SUBSCRIBER_WEEKLY} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.08)' }} />
                  <Bar dataKey="newSubs" fill="#C9A84C" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          {activeTab === 'content' ? (
            <>
              <p className={styles.placeholderNote}>
                Recent published posts from your CMS. Hook views or engagement from GA4 or snapshots when available.
              </p>
              {recentPosts.length === 0 ? (
                <p className={styles.placeholderNote}>No published posts found.</p>
              ) : (
                <ul className={styles.contentList}>
                  {recentPosts.map((post) => (
                    <li key={post.id} className={styles.contentListItem}>
                      <Link className={styles.contentLink} href={`/admin/collections/posts/${post.id}`}>
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.miniCard}>
          <SectionLabel>traffic sources</SectionLabel>
          {MOCK_SOURCES.map((s) => (
            <SourceBar key={s.name} row={s} max={maxSource} />
          ))}
        </div>

        <div className={styles.miniCard}>
          <SectionLabel>event log</SectionLabel>
          {MOCK_EVENTS.map((e, i) => (
            <EventLogRow key={`${e.date}-${i}`} row={e} />
          ))}
        </div>
      </div>
    </div>
  )
}
