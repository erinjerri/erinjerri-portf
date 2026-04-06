import type { AffiliateProduct, AffiliateProductsBlock as AffiliateProductsBlockProps } from '@/payload-types'

import React from 'react'

import { AffiliateLink } from '@/components/analytics/AffiliateLink'
import { Media } from '@/components/Media'
import { buildAmazonAffiliateURL } from '@/utilities/amazon/buildAmazonAffiliateURL'
import {
  isMongoConnectionRetryableError,
  withPayloadClientRetry,
} from '@/utilities/getPayloadClient'
import { cn } from '@/utilities/ui'

type Props = AffiliateProductsBlockProps & {
  id?: string
}

function resolveColumnsClass(columns: Props['columns']): string {
  switch (columns) {
    case '2':
      return 'md:grid-cols-2'
    case '4':
      return 'md:grid-cols-2 lg:grid-cols-4'
    case '3':
    default:
      return 'md:grid-cols-2 lg:grid-cols-3'
  }
}

function coerceAffiliateProducts(
  products: NonNullable<Props['products']>,
): { docs: AffiliateProduct[]; missingIDs: string[] } {
  const docs: AffiliateProduct[] = []
  const missingIDs: string[] = []

  for (const product of products) {
    if (!product) continue
    if (typeof product === 'object') {
      docs.push(product as AffiliateProduct)
      continue
    }
    missingIDs.push(String(product))
  }

  return { docs, missingIDs }
}

function orderByRequestedIDs(docs: AffiliateProduct[], ids: string[]): AffiliateProduct[] {
  if (ids.length === 0) return docs
  const byId = new Map<string, AffiliateProduct>()
  for (const doc of docs) byId.set(String(doc.id), doc)

  const ordered: AffiliateProduct[] = []
  for (const id of ids) {
    const doc = byId.get(String(id))
    if (doc) ordered.push(doc)
  }
  return ordered
}

export const AffiliateProductsBlock: React.FC<Props> = async (props) => {
  const { columns, disclosureText, heading, id, products, showDisclosure } = props

  if (!products || products.length === 0) return null

  const { docs: embeddedDocs, missingIDs } = coerceAffiliateProducts(products)

  let resolvedProducts: AffiliateProduct[] = embeddedDocs

  if (missingIDs.length > 0) {
    try {
      const fetched = await withPayloadClientRetry((payload) =>
        payload.find({
          collection: 'affiliateProducts',
          depth: 1,
          limit: missingIDs.length,
          overrideAccess: false,
          pagination: false,
          where: {
            id: {
              in: missingIDs,
            },
          },
        }),
      )

      const fetchedDocs = fetched.docs as AffiliateProduct[]
      resolvedProducts = [...embeddedDocs, ...fetchedDocs]
      resolvedProducts = orderByRequestedIDs(
        resolvedProducts,
        products.map((p) => String(typeof p === 'object' ? p.id : p)),
      )
    } catch (error) {
      if (isMongoConnectionRetryableError(error)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[AffiliateProductsBlock] MongoDB unavailable — showing embedded products only.',
          )
        }
        resolvedProducts = embeddedDocs
      } else {
        throw error
      }
    }
  }

  const associateTag =
    process.env.AMAZON_ASSOCIATE_TAG?.trim() ||
    process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() ||
    'erinjerrimalo-20'

  return (
    <section className="container" id={id ? `block-${id}` : undefined}>
      {heading ? <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2> : null}
      {showDisclosure ? (
        <p className="mt-2 text-xs text-white/70">
          {disclosureText || 'As an Amazon Associate I earn from qualifying purchases.'}
        </p>
      ) : null}

      <div
        className={cn(
          'mt-6 grid grid-cols-1 gap-6',
          resolveColumnsClass(columns),
        )}
      >
        {resolvedProducts.map((product) => {
          const href = buildAmazonAffiliateURL({
            url: product.productURL ?? '',
            associateTag,
          })

          const openInNewTab = product.openInNewTab ?? true

          return (
            <article
              className="rounded-lg overflow-hidden border border-white/30 bg-[linear-gradient(180deg,rgba(186,230,253,0.24),rgba(56,189,248,0.12))] backdrop-blur-lg shadow-[0_10px_30px_rgba(8,47,73,0.28)]"
              key={String(product.id)}
            >
              <div className="relative aspect-[16/10] w-full bg-black/10">
                {product.image && typeof product.image !== 'string' ? (
                  <Media
                    resource={product.image}
                    size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
                    No image
                  </div>
                )}
              </div>

              <div className="p-4">
                {product.brand ? (
                  <div className="text-xs uppercase tracking-wide text-white/70">{product.brand}</div>
                ) : null}

                <h3 className="mt-1 text-lg font-semibold leading-snug">{product.title}</h3>

                {product.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{product.description}</p>
                ) : null}

                {href ? (
                  <div className="mt-4">
                    <AffiliateLink
                      url={href}
                      product={product.title ?? product.brand ?? 'Unknown'}
                      target={openInNewTab ? '_blank' : '_self'}
                      rel={openInNewTab ? 'sponsored noopener noreferrer' : 'sponsored'}
                      className="inline-flex items-center justify-center rounded-md bg-cyan-300/90 px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-cyan-200"
                    >
                      {product.ctaLabel || 'View on Amazon'}
                    </AffiliateLink>
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
