import { getPayload } from 'payload'

import config from '../payload.config'

type AnyPage = {
  id: number | string
  layout?: unknown
  slug?: string | null
  title?: string | null
}

type AnyHeader = {
  navItems?: unknown
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function hasAffiliateProductsBlock(layout: unknown): boolean {
  const blocks = asArray<{ blockType?: unknown }>(layout)
  return blocks.some((b) => b?.blockType === 'affiliateProductsBlock')
}

function appendAffiliateProductsBlock(layout: unknown): unknown[] {
  const blocks = asArray<Record<string, unknown>>(layout)
  return [
    ...blocks,
    {
      blockType: 'affiliateProductsBlock',
      heading: 'Shop',
      showDisclosure: true,
      disclosureText: 'As an Amazon Associate I earn from qualifying purchases.',
      columns: '3',
      products: [],
    },
  ]
}

function headerHasShopLink(header: AnyHeader, pageId?: string): boolean {
  const navItems = asArray<any>(header.navItems)

  return navItems.some((item) => {
    const link = item?.link
    if (!link) return false

    if (link.type === 'custom' && typeof link.url === 'string') {
      return link.url === '/store'
    }

    if (link.type === 'reference' && link.reference) {
      const reference = link.reference
      const value =
        typeof reference === 'object' && reference !== null && 'value' in reference
          ? String((reference as any).value)
          : typeof reference === 'string'
            ? reference
            : undefined

      return pageId ? value === pageId : false
    }

    return false
  })
}

async function run(): Promise<void> {
  const payload = await getPayload({ config })

  const storeSlug = process.env.STORE_PAGE_SLUG?.trim() || 'store'
  const storeTitle = process.env.STORE_PAGE_TITLE?.trim() || 'Shop'

  const existing = await payload.find({
    collection: 'pages',
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
    where: {
      slug: {
        equals: storeSlug,
      },
    },
  })

  let storePage = existing.docs[0] as AnyPage | undefined

  if (!storePage) {
    storePage = (await payload.create({
      collection: 'pages',
      depth: 0,
      overrideAccess: true,
      data: {
        title: storeTitle,
        slug: storeSlug,
        hero: {
          type: 'none',
        },
        layout: appendAffiliateProductsBlock([]),
      } as any,
    })) as unknown as AnyPage

    payload.logger.info(`Created store page: /${storeSlug}`)
  } else {
    payload.logger.info(`Found store page: /${storeSlug}`)

    if (!hasAffiliateProductsBlock(storePage.layout)) {
      await payload.update({
        collection: 'pages',
        id: storePage.id as any,
        depth: 0,
        overrideAccess: true,
        data: {
          layout: appendAffiliateProductsBlock(storePage.layout),
        } as any,
      })
      payload.logger.info('Appended Affiliate Products block to store page layout.')
    }
  }

  const storePageId = String(storePage.id)

  const header = (await payload.findGlobal({
    slug: 'header',
    depth: 0,
    overrideAccess: true,
  })) as unknown as AnyHeader

  if (!headerHasShopLink(header, storePageId)) {
    const navItems = asArray<any>(header.navItems)

    await payload.updateGlobal({
      slug: 'header',
      depth: 0,
      overrideAccess: true,
      data: {
        navItems: [
          ...navItems,
          {
            link: {
              type: 'reference',
              newTab: false,
              reference: {
                relationTo: 'pages',
                value: storePageId,
              },
              label: storeTitle,
            },
          },
        ],
      } as any,
    })

    payload.logger.info('Added Shop link to Header global navItems.')
  } else {
    payload.logger.info('Header already has a Shop link; no changes made.')
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

