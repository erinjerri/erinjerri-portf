import type { Metadata } from 'next'

import { Media } from '@/components/Media'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PoetryLayout } from '@/components/Poetry/PoetryLayout'
import RichText from '@/components/RichText'
import type { Media as MediaType, Poetry } from '@/payload-types'
import { poetryCanonicalUrlForPath } from '@/utilities/poetry'
import { safeDecodeURIComponent } from '@/utilities/safeDecodeURIComponent'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

type PoetryWithMeta = Poetry & {
  meta?: {
    title?: string | null
    description?: string | null
    image?: string | MediaType | null
  }
}

const formatPoetryDate = (date?: string | null): string | null => {
  if (!date) return null
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export async function generateStaticParams() {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
  if (isBuild) return []

  try {
    const payload = await getPayload({ config: configPromise })
    const poems = await payload.find({
      collection: 'poetry',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
      where: {
        _status: {
          equals: 'published',
        },
      },
    })

    return poems.docs.map(({ slug }) => ({ slug }))
  } catch (err) {
    console.warn('[poetry/[slug]] Skipping static params:', err)
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function PoetryDetailPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = safeDecodeURIComponent(slug)
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
  let poem: PoetryWithMeta | null = null

  try {
    poem = await getPoemBySlug(decodedSlug, draft)
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[poetry/[slug]] Skipping prerender because DB is unavailable:', err)
  }

  if (!poem) {
    if (isBuild) {
      return (
        <PoetryLayout title="Poetry" description="Loading poem...">
          <div className="container max-w-3xl px-6 py-16" />
        </PoetryLayout>
      )
    }

    return <PayloadRedirects url={`/poetry/${decodedSlug}`} />
  }

  const image = typeof poem.featuredImage === 'object' ? poem.featuredImage : null
  const date = formatPoetryDate(poem.publishedDate)

  return (
    <PoetryLayout eyebrow={date ?? 'Poetry'} title={poem.title} description={poem.excerpt ?? undefined}>
      <article className="container max-w-3xl px-6 py-12 md:py-16">
        {image ? (
          <div className="relative mb-12 aspect-[16/10] overflow-hidden rounded-sm border border-border bg-muted">
            <Media
              fill
              imgClassName="object-cover"
              resource={image as MediaType}
              size="(max-width: 768px) 100vw, 48rem"
            />
          </div>
        ) : null}

        {poem.content ? (
          <RichText
            className="prose prose-lg max-w-none leading-9 dark:prose-invert prose-p:my-6 prose-p:leading-9 prose-headings:font-title prose-headings:font-normal"
            data={poem.content}
            enableGutter={false}
          />
        ) : null}
      </article>
    </PoetryLayout>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = safeDecodeURIComponent(slug)
  const canonical = poetryCanonicalUrlForPath(`/poetry/${decodedSlug}`)
  const fallbackTitle = 'Poetry | Erin Jerri'

  try {
    const poem = await getPoemBySlug(decodedSlug, draft)
    const image =
      poem?.meta?.image && typeof poem.meta.image === 'object'
        ? poem.meta.image
        : typeof poem?.featuredImage === 'object'
          ? poem.featuredImage
          : null
    const title = poem?.meta?.title?.trim() || poem?.title || fallbackTitle
    const description = poem?.meta?.description?.trim() || poem?.excerpt || 'Poetry by Erin Jerri.'
    const imageUrl = image?.sizes?.og?.url || image?.url

    return {
      alternates: { canonical },
      description,
      openGraph: {
        description,
        images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
        title,
        type: 'article',
        url: canonical,
      },
      title,
      twitter: {
        card: imageUrl ? 'summary_large_image' : 'summary',
        description,
        title,
      },
    }
  } catch (err) {
    if (process.env.NEXT_PHASE !== 'phase-production-build') throw err
    console.warn('[poetry/[slug]] Skipping metadata because DB is unavailable:', err)
    return {
      alternates: { canonical },
      description: 'Poetry by Erin Jerri.',
      title: fallbackTitle,
    }
  }
}

const getPoemBySlug = async (slug: string, draft: boolean): Promise<PoetryWithMeta | null> => {
  if (draft) {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'poetry',
      draft: true,
      depth: 2,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })

    return (result.docs[0] as PoetryWithMeta | undefined) ?? null
  }

  const getCached = unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'poetry',
        draft: false,
        depth: 2,
        limit: 1,
        pagination: false,
        overrideAccess: false,
        where: {
          and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
        },
      })

      return (result.docs[0] as PoetryWithMeta | undefined) ?? null
    },
    ['poetry', slug],
    { revalidate: 60, tags: [`poetry_${slug}`] },
  )

  return getCached()
}
