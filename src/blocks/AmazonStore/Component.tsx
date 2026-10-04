import type { AffiliateProduct, AmazonStore as AmazonStoreProps } from '@/payload-types'

import React from 'react'

import { AffiliateLink } from '@/components/analytics/AffiliateLink'
import { Media } from '@/components/Media'
import { buildAmazonAffiliateURL } from '@/utilities/amazon/buildAmazonAffiliateURL'
import {
  isMongoConnectionRetryableError,
  withPayloadClientRetry,
} from '@/utilities/getPayloadClient'
import { cn } from '@/utilities/ui'

type Props = AmazonStoreProps & {
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

async function resolveProducts(
  productIds: (string | number | AffiliateProduct | null)[] | null | undefined,
): Promise<AffiliateProduct[]> {
  if (!productIds || productIds.length === 0) return []

  const docs: AffiliateProduct[] = []
  const missingIDs: string[] = []

  for (const product of productIds) {
    if (!product) continue
    if (typeof product === 'object') {
      docs.push(product as AffiliateProduct)
    } else {
      missingIDs.push(String(product))
    }
  }

  if (missingIDs.length === 0) return docs

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

    return [...docs, ...(fetched.docs as AffiliateProduct[])]
  } catch (error) {
    if (isMongoConnectionRetryableError(error)) {
      return docs
    }
    throw error
  }
}

function ProductCard({
  product,
  associateTag,
  style,
  showBrand,
}: {
  product: AffiliateProduct
  associateTag: string
  style: 'minimal' | 'full' | 'compact'
  showBrand: boolean
}) {
  const href = buildAmazonAffiliateURL({
    url: product.productURL ?? '',
    associateTag,
  })

  const openInNewTab = product.openInNewTab ?? true

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative overflow-hidden bg-muted aspect-square">
        {product.image && typeof product.image !== 'string' ? (
          <Media
            alt={
              (typeof product.image.alt === 'string' && product.image.alt.trim()) ||
              product.title ||
              'Product'
            }
            className="h-full w-full"
            imgClassName="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            pictureClassName="h-full w-full"
            resource={product.image}
            size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {showBrand && product.brand && (
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </div>
        )}

        <h3 className="line-clamp-2 font-semibold leading-snug text-foreground">
          {product.title}
        </h3>

        {style === 'full' && product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        )}

        {/* CTA Button */}
        {href && (
          <AffiliateLink
            className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            product={product.title ?? product.brand ?? 'Product'}
            rel={openInNewTab ? 'sponsored noopener noreferrer' : 'sponsored'}
            target={openInNewTab ? '_blank' : '_self'}
            url={href}
          >
            {product.ctaLabel || 'View on Amazon'}
          </AffiliateLink>
        )}
      </div>
    </article>
  )
}

export const AmazonStoreBlock: React.FC<Props> = async (props) => {
  const {
    allProducts,
    cardStyle,
    columns,
    description,
    disclosureText,
    featuredLayout,
    featuredProducts,
    heading,
    id,
    showAllProducts,
    showCategoryTags,
    showDisclosure,
    showFeatured,
  } = props

  const resolvedCardStyle = (cardStyle ?? 'minimal') as 'minimal' | 'full' | 'compact'
  const resolvedFeaturedLayout = (featuredLayout ?? 'carousel') as 'carousel' | 'grid'
  const resolvedShowBrand = showCategoryTags ?? false

  const associateTag =
    process.env.AMAZON_ASSOCIATE_TAG?.trim() ||
    process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() ||
    'erinjerrimalo-20'

  const resolvedFeatured = showFeatured ? await resolveProducts(featuredProducts) : []
  const resolvedAll = showAllProducts ? await resolveProducts(allProducts) : []

  if (!showFeatured && !showAllProducts) return null
  if (resolvedFeatured.length === 0 && resolvedAll.length === 0) return null

  return (
    <section className="container py-12 md:py-16" id={id ? `block-${id}` : undefined}>
      {/* Header */}
      {heading && (
        <div className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {heading}
          </h2>
          {description && (
            <p className="mt-3 text-lg text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Featured Section */}
      {showFeatured && resolvedFeatured.length > 0 && (
        <div className="mb-16">
          <h3 className="mb-6 text-2xl font-semibold">Featured</h3>

          {resolvedFeaturedLayout === 'carousel' ? (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {resolvedFeatured.map((product) => (
                <div key={String(product.id)} className="w-72 flex-shrink-0">
                  <ProductCard
                    associateTag={associateTag}
                    product={product}
                    showBrand={resolvedShowBrand}
                    style={resolvedCardStyle}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className={cn('grid gap-6', resolveColumnsClass(columns))}>
              {resolvedFeatured.map((product) => (
                <ProductCard
                  key={String(product.id)}
                  associateTag={associateTag}
                  product={product}
                  showBrand={resolvedShowBrand}
                  style={resolvedCardStyle}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Products Section */}
      {showAllProducts && resolvedAll.length > 0 && (
        <div>
          <h3 className="mb-6 text-2xl font-semibold">
            {showFeatured ? 'More From Amazon' : 'Shop'}
          </h3>

          <div className={cn('grid gap-6', resolveColumnsClass(columns))}>
            {resolvedAll.map((product) => (
              <ProductCard
                key={String(product.id)}
                associateTag={associateTag}
                product={product}
                showBrand={resolvedShowBrand}
                style={resolvedCardStyle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Disclosure */}
      {showDisclosure && (
        <div className="mt-12 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            {disclosureText || 'As an Amazon Associate I earn from qualifying purchases.'}
          </p>
        </div>
      )}
    </section>
  )
}
