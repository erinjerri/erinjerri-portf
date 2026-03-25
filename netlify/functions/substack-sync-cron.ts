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
  if (process.env.SUBSTACK_SYNC_ENABLED !== 'true') {
    console.log('[substack-sync-cron] SUBSTACK_SYNC_ENABLED is not true; skipping.')
    return { statusCode: 200, body: 'Substack sync disabled.' }
  }

  const baseURL =
    process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.NEXT_PUBLIC_SERVER_URL || ''

  if (!baseURL) {
    console.warn('[substack-sync-cron] Missing base URL (URL/DEPLOY_PRIME_URL/NEXT_PUBLIC_SERVER_URL).')
    return { statusCode: 500, body: 'Missing base URL.' }
  }

  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.warn('[substack-sync-cron] Missing CRON_SECRET; refusing to run.')
    return { statusCode: 500, body: 'Missing CRON_SECRET.' }
  }

  const endpoint = new URL('/next/sync-substack', baseURL)

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  })

  const body = await res.text()

  if (!res.ok) {
    console.warn('[substack-sync-cron] Sync failed:', res.status, body)
  } else {
    console.log('[substack-sync-cron] Sync OK:', body)
  }

  return {
    statusCode: res.ok ? 200 : 500,
    body: body || (res.ok ? 'OK' : 'Failed'),
  }
})
