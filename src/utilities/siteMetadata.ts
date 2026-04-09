/** Production canonical origin for meta tags (explicit SEO; independent of dev env). */
export const CANONICAL_SITE_ORIGIN = 'https://erinjerri.com'

/** Site-wide default document title when a page has no CMS title. */
export const SITE_DEFAULT_TITLE = 'Erin Jerri Pañgilinan — AI, Spatial Computing, TimeBite'

/** Site-wide default meta description. */
export const SITE_DEFAULT_DESCRIPTION =
  'Software engineer, founder, and O’Reilly author building AI and spatial computing systems. Creator of TimeBite, a LifeOS for real-world workflows.'

const TIMEBITE_DESCRIPTION =
  'TimeBite is an AI-powered productivity and spatial computing system designed for real-world workflows.'

/** Fixed SEO for key CMS pages (slug → values). Matched via `canonicalPathToSeoSlug`. */
export const PAGE_SEO_BY_SLUG: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Erin Jerri — AI, Spatial Computing, TimeBite',
    description: SITE_DEFAULT_DESCRIPTION,
  },
  about: {
    title: 'About Erin Jerri Pañgilinan — AI & Spatial Computing',
    description:
      'Erin Jerri Pañgilinan is a software engineer, founder, and O’Reilly author working in AI and spatial computing.',
  },
  timebite: {
    title: 'TimeBite — AI + Spatial Computing LifeOS',
    description: TIMEBITE_DESCRIPTION,
  },
  'timebite-download': {
    title: 'TimeBite — AI + Spatial Computing LifeOS',
    description: TIMEBITE_DESCRIPTION,
  },
  advisory: {
    title: 'Advisory — AI & Spatial Computing Strategy',
    description: SITE_DEFAULT_DESCRIPTION,
  },
  'speaking-info': {
    title: 'Speaking — AI, XR, and Systems',
    description:
      'Keynotes, panels, and workshops on AI, spatial computing, and building at the frontier. Submit a speaking request.',
  },
}

/** Map pathname (with trailing slash normalized) to a key in PAGE_SEO_BY_SLUG. */
export function getFixedPageSeo(canonicalPath: string): { title: string; description: string } | null {
  const path =
    canonicalPath === '/' ? '/' : canonicalPath.replace(/\/$/, '') || '/'
  const key =
    path === '/'
      ? 'home'
      : path === '/about'
        ? 'about'
        : path === '/timebite'
          ? 'timebite'
          : path === '/timebite-download'
            ? 'timebite-download'
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

export const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Erin Jerri Pañgilinan',
  url: CANONICAL_SITE_ORIGIN,
  jobTitle: 'Software Engineer, Founder',
  sameAs: [
    'https://www.linkedin.com/in/erinjerri',
    'https://twitter.com/erinjerri',
    'https://erinjerri.substack.com',
  ],
} as const
