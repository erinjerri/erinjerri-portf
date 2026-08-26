import './loadEnv'

import { getPayload } from 'payload'

/**
 * Removes the CMS-managed "Buy" (or "Shop") group from the Footer global.
 *
 * The Buy column is now rendered by the `BuyFooterGroup` component in
 * src/Footer/Component.tsx, sourced from src/config/creatingYourReality.ts.
 * Leaving a CMS group with the same name produces two Buy columns, because the
 * component's fallback only checks for a group literally named "shop".
 *
 * Every other footer group is passed through untouched. Payload globals have no
 * draft state, so this is live on save.
 *
 * Run:  pnpm remove:footer-buy
 */

const TARGET_HEADERS = ['buy', 'shop']

async function run(): Promise<void> {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const footer = (await payload.findGlobal({
    slug: 'footer',
    depth: 0,
    overrideAccess: true,
  })) as { linkGroups?: unknown[] }

  const groups = Array.isArray(footer.linkGroups) ? footer.linkGroups : []

  const kept = groups.filter((g) => {
    const header = String((g as { header?: string })?.header ?? '')
      .trim()
      .toLowerCase()
    return !TARGET_HEADERS.includes(header)
  })

  const removed = groups.length - kept.length

  if (removed === 0) {
    payload.logger.info('No CMS "Buy" or "Shop" group found. Nothing to remove.')
    return
  }

  await payload.updateGlobal({
    slug: 'footer',
    context: { disableRevalidate: true },
    depth: 0,
    overrideAccess: true,
    data: { linkGroups: kept } as never,
  })

  payload.logger.info(`Removed ${removed} CMS footer group(s) named Buy/Shop.`)
  payload.logger.info(
    `Remaining groups: ${kept
      .map((g) => (g as { header?: string })?.header ?? '(untitled)')
      .join(', ')}`,
  )
  payload.logger.info('The Buy column now comes from BuyFooterGroup in the component.')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
