import './loadEnv'

import { getPayload } from 'payload'

import { mergeHomeHireMeLayoutBlocks } from '../endpoints/seed/home-hire-me-layout'
import type { Page } from '../payload-types'

async function run(): Promise<void> {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: 'home',
      },
    },
  })

  const homePage = result.docs[0]

  if (!homePage) {
    throw new Error('Home page not found. Seed the site first, then rerun this script.')
  }

  const mergedLayout = mergeHomeHireMeLayoutBlocks(homePage.layout)
  const currentLayout = Array.isArray(homePage.layout) ? homePage.layout : []

  if (JSON.stringify(currentLayout) === JSON.stringify(mergedLayout)) {
    payload.logger.info('Home page already has editable ribbon, stats, and bio blocks.')
    return
  }

  await payload.update({
    collection: 'pages',
    id: homePage.id,
    depth: 0,
    overrideAccess: true,
    context: {
      disableRevalidate: true,
    },
    data: {
      layout: mergedLayout,
    } as Partial<Page>,
  })

  payload.logger.info('Persisted ribbon, stats, and bio blocks onto the home page.')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
