import './loadEnv'

import { getPayload } from 'payload'

/**
 * Rebuilds the footer "Buy" group so the three storefronts are distinct.
 *
 * Today it reads Books / Store, and "Store" points at /store — which is now the
 * planner pre-order page, not the Amazon affiliate store. Three products, two
 * links, one of them mislabelled.
 *
 *   Books                 -> the O'Reilly title (internal page)
 *   Amazon Store          -> the affiliate storefront (external)
 *   Creating Your Reality -> the planner pre-order (external, or /store)
 *
 * The Amazon URL is read from the environment so it never has to be pasted into
 * a shared transcript:
 *
 *   AMAZON_STORE_URL="https://www.amazon.com/shop/..." pnpm ensure:footer-buy
 *
 * Without it, the Amazon row is skipped and everything else still applies.
 *
 * Unlike the page scripts this writes a global, and Payload globals have no
 * draft state here — the change is live on save. Only the "Buy" group is
 * touched; every other group is passed through untouched.
 */

const CYR_URL = process.env.CYR_STORE_URL?.trim() || 'https://cyra-site.netlify.app/'
const AMAZON_URL = process.env.AMAZON_STORE_URL?.trim() || ''
const BOOK_PAGE_SLUG = process.env.BOOK_PAGE_SLUG?.trim() || 'CreatingARVRBook'

async function run(): Promise<void> {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const footer = (await payload.findGlobal({
    slug: 'footer',
    depth: 0,
    overrideAccess: true,
  })) as { linkGroups?: unknown[] }

  const groups = Array.isArray(footer.linkGroups) ? [...footer.linkGroups] : []
  const buyIndex = groups.findIndex(
    (g) => String((g as { header?: string })?.header ?? '').trim().toLowerCase() === 'buy',
  )

  if (buyIndex === -1) {
    payload.logger.error('No "Buy" group found in the footer. Nothing changed.')
    return
  }

  const bookPage = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: BOOK_PAGE_SLUG } },
  })

  const bookId = bookPage.docs[0]?.id
  if (!bookId) {
    payload.logger.warn(
      `Page /${BOOK_PAGE_SLUG} not found — the Books row will be left as it is.`,
    )
  }

  const existingBuy = groups[buyIndex] as { header?: string; links?: unknown[] }
  const existingLinks = Array.isArray(existingBuy.links) ? existingBuy.links : []
  /** Reuse the current Books row when the page lookup fails, so nothing is lost. */
  const fallbackBooksRow = existingLinks[0]

  const links: unknown[] = []

  links.push(
    bookId
      ? {
          link: {
            type: 'reference',
            label: 'Books',
            reference: { relationTo: 'pages', value: bookId },
          },
        }
      : fallbackBooksRow,
  )

  if (AMAZON_URL) {
    links.push({
      link: { type: 'custom', label: 'Amazon Store', url: AMAZON_URL, newTab: true },
    })
  } else {
    payload.logger.warn(
      'AMAZON_STORE_URL not set — skipping the Amazon Store row. Re-run with it, or add that row by hand in the admin.',
    )
  }

  links.push({
    link: { type: 'custom', label: 'Creating Your Reality', url: CYR_URL, newTab: true },
  })

  groups[buyIndex] = { ...existingBuy, header: 'Buy', links: links.filter(Boolean) }

  await payload.updateGlobal({
    slug: 'footer',
    context: { disableRevalidate: true },
    depth: 0,
    overrideAccess: true,
    data: { linkGroups: groups } as never,
  })

  payload.logger.info('Footer "Buy" group updated:')
  for (const l of links.filter(Boolean) as { link?: { label?: string; url?: string } }[]) {
    payload.logger.info(`   - ${l.link?.label ?? '(existing row)'}${l.link?.url ? ` -> ${l.link.url}` : ''}`)
  }
  payload.logger.info('Other footer groups were not touched.')
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
