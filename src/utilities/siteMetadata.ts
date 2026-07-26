const withoutTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

export const SITE_OWNER_NAME = process.env.NEXT_PUBLIC_SITE_OWNER_NAME?.trim() || 'Your Name'

/** Canonical origin used by metadata, sitemaps, and structured data. */
export const CANONICAL_SITE_ORIGIN = withoutTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
    'http://localhost:3000',
)

/** Site-wide document title used when a Payload page has no SEO title. */
export const SITE_DEFAULT_TITLE =
  process.env.NEXT_PUBLIC_SITE_TITLE?.trim() || `${SITE_OWNER_NAME} — Portfolio`

/** Site-wide description used when a Payload page has no SEO description. */
export const SITE_DEFAULT_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
  'Portfolio, selected work, writing, and ways to collaborate.'

/** Fixed SEO for common CMS pages. Payload SEO fields still take precedence. */
export const PAGE_SEO_BY_SLUG: Record<string, { title: string; description: string }> = {
  home: {
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
  },
  about: {
    title: `About ${SITE_OWNER_NAME}`,
    description: `Learn more about ${SITE_OWNER_NAME}, their experience, and the work they care about.`,
  },
  advisory: {
    title: `Advisory — ${SITE_OWNER_NAME}`,
    description: SITE_DEFAULT_DESCRIPTION,
  },
  'speaking-info': {
    title: `Speaking — ${SITE_OWNER_NAME}`,
    description: `Talks, workshops, and speaking information for ${SITE_OWNER_NAME}.`,
  },
}

/** Map a pathname to a key in PAGE_SEO_BY_SLUG. */
export function getFixedPageSeo(
  canonicalPath: string,
): { title: string; description: string } | null {
  const path = canonicalPath === '/' ? '/' : canonicalPath.replace(/\/$/, '') || '/'
  const key =
    path === '/'
      ? 'home'
      : path === '/about'
        ? 'about'
        : path === '/advisory'
          ? 'advisory'
          : path === '/speaking-info'
            ? 'speaking-info'
            : null
  return key ? (PAGE_SEO_BY_SLUG[key] ?? null) : null
}

export function canonicalUrlForPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (normalized === '/') return `${CANONICAL_SITE_ORIGIN}/`
  return `${CANONICAL_SITE_ORIGIN}${normalized}`
}

const sameAs = [
  process.env.NEXT_PUBLIC_LINKEDIN_URL,
  process.env.NEXT_PUBLIC_GITHUB_URL,
  process.env.NEXT_PUBLIC_SOCIAL_URL,
  process.env.NEXT_PUBLIC_SUBSTACK_URL,
].filter((value): value is string => Boolean(value?.trim()))

export const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_OWNER_NAME,
  url: CANONICAL_SITE_ORIGIN,
  jobTitle: process.env.NEXT_PUBLIC_SITE_OWNER_ROLE?.trim() || 'Creator',
  ...(sameAs.length > 0 ? { sameAs } : {}),
}
