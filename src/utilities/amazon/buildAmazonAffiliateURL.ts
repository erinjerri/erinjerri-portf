type Args = {
  associateTag: string
  url: string
}

const looksLikeAmazonHost = (host: string): boolean => {
  const normalized = host.toLowerCase()

  // Examples:
  // - www.amazon.com
  // - smile.amazon.com
  // - amazon.co.uk
  // - www.amazon.ca
  if (normalized === 'amzn.to') return false
  if (normalized === 'amazon.com') return true
  if (normalized.endsWith('.amazon.com')) return true
  if (normalized.startsWith('amazon.')) return true
  if (normalized.includes('.amazon.')) return true

  return false
}

export function buildAmazonAffiliateURL({ associateTag, url }: Args): string {
  const trimmedURL = url.trim()
  if (!trimmedURL) return ''

  const trimmedTag = associateTag.trim()
  if (!trimmedTag) return trimmedURL

  try {
    const parsed = new URL(trimmedURL)

    if (!looksLikeAmazonHost(parsed.hostname)) return trimmedURL

    // Respect an explicit tag already in the URL.
    if (parsed.searchParams.has('tag')) return trimmedURL

    parsed.searchParams.set('tag', trimmedTag)
    return parsed.toString()
  } catch {
    return trimmedURL
  }
}

