import './loadEnv'

import { getPayload } from 'payload'

import type { Page } from '../payload-types'

/**
 * Moves the TimeBite product screenshot out of the hero and into a real
 * `productShowcase` layout block.
 *
 * The screenshot used to render from `hero.productMockup` through a hard-coded
 * component, so its headline, blurb, and CTA were literals in the source and
 * could not be edited or reordered in Payload. This copies the image reference
 * onto a block and seeds the copy that was previously hard-coded, so nothing
 * visibly changes but everything becomes editable.
 *
 * Idempotent: re-running is a no-op once the block exists.
 */

const HARD_CODED_COPY = {
  eyebrow: 'TimeBite',
  headline: 'Make time work for you.',
  blurb: 'An AI-native workspace for turning what matters into what happens next.',
  windowLabel: 'TimeBite',
} as const

async function run(): Promise<void> {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: 'home' } },
  })

  const homePage = result.docs[0]

  if (!homePage) {
    throw new Error('Home page not found. Seed the site first, then rerun this script.')
  }

  const layout = Array.isArray(homePage.layout) ? [...homePage.layout] : []

  if (layout.some((block) => block?.blockType === 'productShowcase')) {
    payload.logger.info('Home page already has a Product showcase block. Nothing to do.')
    return
  }

  const screenshot = (homePage.hero as { productMockup?: unknown } | undefined)?.productMockup

  if (!screenshot) {
    payload.logger.warn(
      'No hero.productMockup set on the home page, so there is no image to migrate. Add the block manually in Payload.',
    )
    return
  }

  // Placed directly after the hero-adjacent first section so it lands where the
  // showcase used to render, rather than at the end of the page.
  const insertAt = Math.min(1, layout.length)

  layout.splice(insertAt, 0, {
    blockType: 'productShowcase',
    blockName: 'Product showcase',
    screenshot,
    background: 'light',
    ...HARD_CODED_COPY,
    links: [
      {
        link: {
          type: 'custom',
          appearance: 'default',
          label: 'Join the TimeBite beta',
          url: '/timebite-download',
        },
      },
    ],
  } as NonNullable<Page['layout']>[number])

  await payload.update({
    collection: 'pages',
    id: homePage.id,
    depth: 0,
    overrideAccess: true,
    data: { layout } as Partial<Page>,
  })

  payload.logger.info(
    `Added Product showcase block at position ${insertAt} on the home page, on a light surface.`,
  )
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
