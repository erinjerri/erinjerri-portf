import type { Metadata } from 'next'

import { Media } from '@/components/Media'
import { PoetryLayout } from '@/components/Poetry/PoetryLayout'
import type { Media as MediaType } from '@/payload-types'
import { poetryCanonicalUrlForPath, POETRY_ORIGIN } from '@/utilities/poetry'
import configPromise from '@payload-config'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

const POETRY_DESCRIPTION =
  'Poetry and creative writing by Erin Jerri Pañgilinan.'

const formatPoetryDate = (date?: string | null): string | null => {
  if (!date) return null
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

const getCachedPoems = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    return payload.find({
      collection: 'poetry',
      draft: false,
      depth: 1,
      limit: 100,
      overrideAccess: false,
      sort: '-publishedDate',
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedDate: true,
        featured: true,
        tags: true,
        meta: true,
      },
    })
  },
  ['poetry-index'],
  { revalidate: 60, tags: ['poetry'] },
)

type PoetryCardPoem = Awaited<ReturnType<typeof getCachedPoems>>['docs'][number]

function PoetryCard({ poem, featured = false }: { poem: PoetryCardPoem; featured?: boolean }) {
  const image = typeof poem.featuredImage === 'object' ? poem.featuredImage : null
  const date = formatPoetryDate(poem.publishedDate)

  return (
    <article className="grid gap-6 border-t border-border/70 py-8 md:grid-cols-[minmax(0,1fr)_13rem] md:items-start">
      <div>
        {date ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {date}
          </p>
        ) : null}
        <h2 className={featured ? 'font-title text-4xl font-normal leading-tight' : 'font-title text-3xl font-normal leading-tight'}>
          <Link className="hover:text-foreground/70" href={`/poetry/${poem.slug}`} prefetch={false}>
            {poem.title}
          </Link>
        </h2>
        {poem.excerpt ? (
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">{poem.excerpt}</p>
        ) : null}
        {poem.tags?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {poem.tags.map((item, index) =>
              item?.tag ? (
                <span
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  key={item.id ?? index}
                >
                  {item.tag}
                </span>
              ) : null,
            )}
          </div>
        ) : null}
      </div>

      {image ? (
        <Link
          className="relative block aspect-[4/5] overflow-hidden rounded-sm border border-border bg-muted"
          href={`/poetry/${poem.slug}`}
          prefetch={false}
        >
          <Media
            fill
            imgClassName="object-cover"
            resource={image as MediaType}
            size="(max-width: 768px) 100vw, 13rem"
          />
        </Link>
      ) : null}
    </article>
  )
}

export default async function PoetryPage() {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
  let poems: Awaited<ReturnType<typeof getCachedPoems>>

  try {
    poems = await getCachedPoems()
  } catch (err) {
    if (!isBuild) throw err
    console.warn('[poetry/page] Skipping prerender because DB is unavailable:', err)
    poems = { docs: [], totalDocs: 0, limit: 100, totalPages: 1, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null }
  }

  const featuredPoems = poems.docs.filter((poem) => poem.featured)
  const latestPoems = poems.docs

  return (
    <PoetryLayout
      title="Poetry"
      description="A quieter room for poems, fragments, and creative writing."
    >
      <div className="container max-w-5xl px-6 py-12 md:py-16">
        {featuredPoems.length ? (
          <section className="mb-16">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Featured
              </h2>
              <Link className="text-sm text-muted-foreground hover:text-foreground" href="#all-poems">
                All poetry entries
              </Link>
            </div>
            {featuredPoems.map((poem) => (
              <PoetryCard featured key={poem.id} poem={poem} />
            ))}
          </section>
        ) : null}

        <section id="all-poems">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Latest Poems
          </h2>
          {latestPoems.length ? (
            latestPoems.map((poem) => <PoetryCard key={poem.id} poem={poem} />)
          ) : (
            <p className="border-t border-border/70 py-8 text-muted-foreground">
              No published poems yet.
            </p>
          )}
        </section>
      </div>
    </PoetryLayout>
  )
}

export const metadata: Metadata = {
  alternates: {
    canonical: poetryCanonicalUrlForPath('/'),
  },
  description: POETRY_DESCRIPTION,
  openGraph: {
    description: POETRY_DESCRIPTION,
    title: 'Poetry | Erin Jerri',
    type: 'website',
    url: POETRY_ORIGIN,
  },
  title: 'Poetry | Erin Jerri',
}
