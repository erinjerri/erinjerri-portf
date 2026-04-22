import { schedule } from '@netlify/functions'

/**
 * Runs Substack RSS → Payload import on a schedule (Netlify).
 *
 * Payload’s `substackSync` task registers a cron in config, but on serverless
 * hosts nothing drains the `substack` job queue unless something calls your app.
 * This function mirrors the README flow: POST /next/sync-substack with CRON_SECRET.
 *
 * Netlify requires the cron expression to be a string literal here (no env interpolation).
 * Default: every hour at minute 0. Edit the literal if you need a different cadence.
 *
 * Required env (Netlify UI): CRON_SECRET, URL (or DEPLOY_PRIME_URL / NEXT_PUBLIC_SERVER_URL)
 * Optional: SUBSTACK_SYNC_ENABLED=true (if unset/false, handler no-ops successfully)
 */
export const handler = schedule('0 * * * *', async () => {
  const startedAt = Date.now()
  const jsonResponse = (statusCode: number, payload: Record<string, unknown>) => ({
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })

  const syncEnabledRaw = process.env.SUBSTACK_SYNC_ENABLED?.trim().toLowerCase()
  const syncEnabled = syncEnabledRaw !== 'false'
  if (!syncEnabled) {
    console.log('[substack-sync-cron] SUBSTACK_SYNC_ENABLED=false; skipping.')
    return jsonResponse(200, {
      ok: true,
      code: 'SYNC_DISABLED',
      message: 'Substack sync disabled.',
      durationMs: Date.now() - startedAt,
    })
  }

  const baseURLRaw =
    process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.NEXT_PUBLIC_SERVER_URL || ''

  if (!baseURLRaw) {
    console.warn('[substack-sync-cron] Missing base URL (URL/DEPLOY_PRIME_URL/NEXT_PUBLIC_SERVER_URL).')
    return jsonResponse(500, {
      ok: false,
      code: 'MISSING_BASE_URL',
      message: 'Missing base URL (URL/DEPLOY_PRIME_URL/NEXT_PUBLIC_SERVER_URL).',
      durationMs: Date.now() - startedAt,
    })
  }

  const normalizeBaseURL = (value: string): string => {
    const trimmed = value.trim()
    if (!trimmed) return ''
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return `https://${trimmed}`
  }

  const baseURL = normalizeBaseURL(baseURLRaw)

  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.warn('[substack-sync-cron] Missing CRON_SECRET; refusing to run.')
    return jsonResponse(500, {
      ok: false,
      code: 'MISSING_CRON_SECRET',
      message: 'Missing CRON_SECRET.',
      durationMs: Date.now() - startedAt,
    })
  }

  let endpoint: URL
  try {
    endpoint = new URL('/next/sync-substack', baseURL)
  } catch {
    console.warn('[substack-sync-cron] Invalid base URL:', baseURLRaw)
    return jsonResponse(500, {
      ok: false,
      code: 'INVALID_BASE_URL',
      message: 'Invalid base URL.',
      baseURLRaw,
      durationMs: Date.now() - startedAt,
    })
  }
  const syncMode = process.env.SUBSTACK_SYNC_MODE === 'review' ? 'review' : 'auto_publish'
  const requestMeta = {
    endpoint: endpoint.toString(),
    mode: syncMode,
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'x-substack-sync-mode': syncMode,
      },
    })

    const rawBody = await res.text()
    const responseSnippet = rawBody.length > 1200 ? `${rawBody.slice(0, 1200)}…` : rawBody
    const durationMs = Date.now() - startedAt

    if (!res.ok) {
      console.warn('[substack-sync-cron] Sync failed:', {
        ...requestMeta,
        httpStatus: res.status,
        responseSnippet,
        durationMs,
      })
      return jsonResponse(500, {
        ok: false,
        code: 'SYNC_FAILED',
        httpStatus: res.status,
        responseSnippet,
        durationMs,
        ...requestMeta,
      })
    }

    console.log('[substack-sync-cron] Sync OK:', {
      ...requestMeta,
      httpStatus: res.status,
      responseSnippet,
      durationMs,
    })
    return jsonResponse(200, {
      ok: true,
      code: 'SYNC_OK',
      httpStatus: res.status,
      responseSnippet,
      durationMs,
      ...requestMeta,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown fetch error'
    const durationMs = Date.now() - startedAt
    console.warn('[substack-sync-cron] Sync request error:', {
      ...requestMeta,
      error: message,
      durationMs,
    })
    return jsonResponse(500, {
      ok: false,
      code: 'SYNC_REQUEST_ERROR',
      error: message,
      durationMs,
      ...requestMeta,
    })
  }
})
