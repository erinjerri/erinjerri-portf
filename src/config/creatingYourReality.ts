const DEFAULT_SUBSTACK_URL = 'https://erinjerri.substack.com'
const DEFAULT_CYRA_URL = 'https://cyra-site.netlify.app/'

function resolveSubstackSubscribeURL(): string {
  const configured = process.env.SUBSTACK_SUBSCRIBE_URL?.trim() || DEFAULT_SUBSTACK_URL

  try {
    const url = new URL(configured)
    if (!url.hostname.toLowerCase().endsWith('.substack.com')) return `${DEFAULT_SUBSTACK_URL}/subscribe`
    url.pathname = '/subscribe'
    url.search = ''
    url.hash = ''
    return url.toString()
  } catch {
    return `${DEFAULT_SUBSTACK_URL}/subscribe`
  }
}

function resolveCYRPlannerURL(): string {
  const configured = process.env.CYR_PLANNER_URL?.trim() || process.env.CYR_SITE_URL?.trim() || DEFAULT_CYRA_URL

  try {
    const url = new URL(configured)
    url.searchParams.set('utm_source', 'erinjerri_profile')
    url.searchParams.set('utm_medium', 'portfolio')
    url.searchParams.set('utm_campaign', 'planner_preorder')
    return url.toString()
  } catch {
    return DEFAULT_CYRA_URL
  }
}

/** Amazon Associates tag — every Amazon link needs it or it earns nothing. */
const AMAZON_TAG = 'erinjerrimalo-20'
const DEFAULT_AMAZON_URL = `https://www.amazon.com/dp/1492044199?tag=${AMAZON_TAG}`

export const creatingYourRealityConfig = {
  route: '/shop/creating-your-reality',
  /** The O'Reilly title page. Slug is `CreatingARVRBook`, not a kebab variant. */
  booksURL: '/CreatingARVRBook',
  amazonURL: process.env.AMAZON_STORE_URL?.trim() || DEFAULT_AMAZON_URL,
  cyraURL: process.env.CYR_SITE_URL?.trim() || DEFAULT_CYRA_URL,
  app: {
    exploreURL: process.env.CYR_TIMEBITE_URL?.trim() || '/timebite',
    pricingURL: process.env.CYR_TIMEBITE_PRICING_URL?.trim() || '/timebite',
    freePrice: '$0',
    premiumPrice: '$9.99/month',
    annualPrice: '$79/year',
  },
  planner: {
    retailPrice: '$49 target retail',
    status: 'Coming soon / preorder planned',
    productURL: resolveCYRPlannerURL(),
    updatesURL: resolveSubstackSubscribeURL(),
  },
  bundle: {
    price: '$119/year',
    status: 'Planned annual bundle',
  },
} as const
