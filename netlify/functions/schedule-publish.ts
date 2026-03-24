import { schedule } from '@netlify/functions'

const CRON = process.env.PAYLOAD_SCHEDULE_PUBLISH_CRON || '*/5 * * * *'

export const handler = schedule(CRON, async () => {
  const baseURL =
    process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.NEXT_PUBLIC_SERVER_URL || ''

  if (!baseURL) {
    console.warn('[schedule-publish] Missing base URL (URL/DEPLOY_PRIME_URL/NEXT_PUBLIC_SERVER_URL).')
    return { statusCode: 500, body: 'Missing base URL.' }
  }

  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.warn('[schedule-publish] Missing CRON_SECRET; refusing to run.')
    return { statusCode: 500, body: 'Missing CRON_SECRET.' }
  }

  const endpoint = new URL('/api/payload-jobs/run?queue=schedulePublish', baseURL)

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: 'application/json',
    },
  })

  const body = await res.text()

  if (!res.ok) {
    console.warn('[schedule-publish] Job runner failed:', res.status, body)
  } else {
    console.log('[schedule-publish] Job runner OK:', body)
  }

  return {
    statusCode: res.ok ? 200 : 500,
    body: body || (res.ok ? 'OK' : 'Failed'),
  }
})
