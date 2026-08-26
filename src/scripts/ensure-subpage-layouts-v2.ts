import './loadEnv'

import { getPayload } from 'payload'

import type { Page } from '../payload-types'

/**
 * Reorders /speaking-info and /advisory as DRAFTS.
 *
 * Same two guarantees as ensure-home-layout-v2, because this runs against the
 * production database:
 *   1. No block is ever deleted. Types not named in the order list keep their
 *      relative position at the end.
 *   2. Written with `draft: true` — published pages are untouched until
 *      someone hits Publish.
 *
 * Existing copy is left alone. This fixes ordering only; wording is edited in
 * the admin.
 *
 * Run:  pnpm ensure:subpages-v2
 */

type LayoutBlock = NonNullable<Page['layout']>[number]

/**
 * /speaking-info — the problem being fixed: "Logistical notes" and the
 * incomplete-submissions warning currently sit ABOVE "My expertise", so the
 * first thing a buyer reads is a rule about paperwork. Logistics move down to
 * sit directly above the form, where they read as professionalism.
 */
const SPEAKING_ORDER = [
  'content', // intro — "I speak about what happens after the model"
  'signatureTalks', // the lineup, promoted
  'tagPills', // formats & audiences
  'statStrip', // proof: countries, languages, years
  'bookAcclaimStrip',
  'mediaBlock',
  'cta', // terms + booking CTA, immediately above the form
  'formBlock',
]

/**
 * /advisory — "Working With Me", "What I Do" and "What This Is" cover one idea
 * in three voices. The "Who this is NOT for" block is the strongest thing on
 * the page and is currently stranded near the bottom; it belongs beside "Who
 * this is for", because the contrast is what does the qualifying.
 */
const ADVISORY_ORDER = [
  'content', // merged opening statement
  'tagPills', // focus areas
  'statStrip',
  'cta',
  'formBlock',
]

function reorder(blocks: LayoutBlock[], order: string[]): LayoutBlock[] {
  return blocks
    .map((block, originalIndex) => {
      const type = (block as { blockType?: string }).blockType ?? ''
      const rank = order.indexOf(type)
      return { block, originalIndex, rank: rank === -1 ? order.length : rank }
    })
    .sort((a, b) => a.rank - b.rank || a.originalIndex - b.originalIndex)
    .map((entry) => entry.block)
}

async function applyTo(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  order: string[],
): Promise<void> {
  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  const page = result.docs[0]
  if (!page) {
    payload.logger.warn(`Page /${slug} not found — skipping.`)
    return
  }

  const current: LayoutBlock[] = Array.isArray(page.layout) ? [...page.layout] : []
  const next = reorder(current, order)

  if (JSON.stringify(current) === JSON.stringify(next)) {
    payload.logger.info(`/${slug} already in the target order. Nothing to do.`)
    return
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    draft: true,
    overrideAccess: true,
    data: { layout: next } as Partial<Page>,
  })

  const before = current.map((b) => (b as { blockType?: string }).blockType).join(' → ')
  const after = next.map((b) => (b as { blockType?: string }).blockType).join(' → ')
  payload.logger.info(`/${slug} reordered as DRAFT (${current.length} blocks, 0 removed)`)
  payload.logger.info(`   before: ${before}`)
  payload.logger.info(`   after:  ${after}`)
}

async function run(): Promise<void> {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  await applyTo(payload, 'speaking-info', SPEAKING_ORDER)
  await applyTo(payload, 'advisory', ADVISORY_ORDER)

  payload.logger.info('Review both at /admin → Pages, then Publish when they look right.')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
