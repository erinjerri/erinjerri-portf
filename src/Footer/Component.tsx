import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { Facebook, Github, Linkedin, Mail, Youtube } from 'lucide-react'
import Link from 'next/link'
import path from 'path'
import React from 'react'
import { existsSync } from 'fs'

import type { Footer, Media as MediaType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { SubscribeForm } from './SubscribeForm'
import { SocialIconImage } from './SocialIconImage'

const resolveFallbackSocialIcon = (
  label: string,
  url: string,
): React.ComponentType<{ className?: string }> => {
  const value = `${label} ${url}`.toLowerCase()

  if (value.includes('mail') || value.includes('email') || url.includes('@')) return Mail
  if (value.includes('github')) return Github
  if (value.includes('linkedin')) return Linkedin
  if (value.includes('youtube')) return Youtube
  if (value.includes('facebook')) return Facebook

  return Github
}

const hasLocalMediaFile = (mediaUrl: string): boolean => {
  if (!mediaUrl.startsWith('/media/')) return true
  if (process.env.NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY === 'true') return true

  const [pathname] = mediaUrl.split('?')
  const relativePath = pathname.replace(/^\/media\//, '')

  if (!relativePath) return false

  try {
    const decodedPath = decodeURIComponent(relativePath)
    const filePath = path.join(process.cwd(), 'public', 'media', decodedPath)
    return existsSync(filePath)
  } catch {
    return false
  }
}

const isBrokenR2Url = (u: string | null | undefined): boolean =>
  Boolean(u && typeof u === 'string' && u.includes('r2.cloudflarestorage.com'))

const getSubstackPublicationURL = (): string => {
  const raw = process.env.SUBSTACK_SUBSCRIBE_URL?.trim()
  if (!raw) return 'https://erinjerri.substack.com'

  const trimmed = raw.replace(/\/$/, '')
  const lower = trimmed.toLowerCase()

  if (lower.includes('/api/v1/free')) {
    return trimmed.replace(/\/api\/v1\/free(\?.*)?$/i, '')
  }

  if (lower.endsWith('.substack.com') || lower.includes('.substack.com/')) {
    return lower.endsWith('/subscribe') ? trimmed.replace(/\/subscribe$/i, '') : trimmed
  }

  return 'https://erinjerri.substack.com'
}

function SocialIcon({
  url,
  label,
  icon,
}: {
  url: string
  label: string
  icon?: MediaType | string | null
}) {
  const iconDoc = icon && typeof icon === 'object' ? icon : null
  const fallbackIconPath = iconDoc?.filename
    ? `/media/${encodeURI(iconDoc.filename.replace(/^\/+/, ''))}`
    : null

  // Prefer Payload url; if it's a broken R2 S3 API URL (not publicly readable),
  // use path-based fallback so proxy can serve it.
  const primaryUrl = iconDoc?.url ?? null
  const urlToResolve =
    primaryUrl && !isBrokenR2Url(primaryUrl) ? primaryUrl : (fallbackIconPath ?? primaryUrl)

  // Omit cache tag: R2 rejects URLs with ?timestamp query params; footer icons don't need cache-busting
  const iconUrl = urlToResolve ? getMediaUrl(urlToResolve, null) : null
  const fallbackIcon = resolveFallbackSocialIcon(label, url)
  // Use icon URL when: local /media/ file exists, or it's an external URL (R2, etc.)
  const resolvedIconUrl =
    iconUrl && (hasLocalMediaFile(iconUrl) || iconUrl.startsWith('http'))
      ? iconUrl
      : null
  const href =
    url.includes('@') && !url.includes('://') && !url.startsWith('mailto:') ? `mailto:${url}` : url
  const isExternal = href.startsWith('http://') || href.startsWith('https://')
  const FallbackIcon = fallbackIcon

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="text-foreground hover:text-foreground/80 transition-colors"
      aria-label={label}
    >
      {resolvedIconUrl ? (
        <SocialIconImage
          src={resolvedIconUrl}
          alt=""
          className="h-5 w-5 object-contain"
          fallback={<FallbackIcon className="h-5 w-5" />}
        />
      ) : (
        <FallbackIcon className="h-5 w-5" />
      )}
    </Link>
  )
}

interface FooterProps {
  data?: Footer | null
}

export async function Footer({ data }: FooterProps = {}) {
  const substackPublicationURL = getSubstackPublicationURL()
  const substackEmbedSrc = `${substackPublicationURL.replace(/\/$/, '')}/embed`
  let footerData: Footer | null = data ?? null

  if (data === undefined) {
    try {
      footerData = (await getCachedGlobal('footer', 2)()) as Footer
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Footer] Failed to fetch footer:', err)
      }
      // Fallback so layout still renders if footer query stalls/errors
    }
  }

  const subscribeSection = footerData?.subscribeSection
  const linkGroups = footerData?.linkGroups || []
  const socialLinks = footerData?.socialLinks || []
  const copyright = footerData?.copyright

  return (
    <footer className="mt-auto border-t border-border bg-transparent text-foreground [contain:layout]">
      <div className="container py-10">
        {/* Main footer content - two columns */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16 lg:items-start">
          {/* Left column: Logo, Subscribe, Slogan, Social */}
          <div className="flex min-h-0 flex-col gap-6 lg:max-w-sm">
            <Link className="flex items-center" href="/">
              <Logo />
            </Link>

            {subscribeSection?.showSubscribe !== false && (
              <div className="min-h-[3.25rem] w-full max-w-full">
                <SubscribeForm action={substackEmbedSrc} />
              </div>
            )}

            {subscribeSection?.slogan && (
              <p className="text-sm text-muted-foreground">{subscribeSection.slogan}</p>
            )}

            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks
                  .filter((item) => item?.url && item?.label)
                  .map((item, i) => (
                    <SocialIcon
                      key={item.id || i}
                      url={item.url}
                      label={item.label}
                      icon={typeof item.icon === 'object' && item.icon ? item.icon : null}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Right column: Link groups */}
          {linkGroups.length > 0 && (
            <nav className="flex flex-wrap gap-x-12 gap-y-8">
              {linkGroups.map((group, groupIndex) => (
                <div key={group.id || groupIndex} className="flex min-h-0 flex-col gap-3">
                  {group.header && (
                    <span className="block min-h-[1.5rem] font-semibold leading-6 text-foreground">
                      {group.header}
                    </span>
                  )}
                  <ul className="flex flex-col gap-2">
                    {group.links?.map((item, linkIndex) => {
                      const link = item?.link
                      if (!link?.label) return null
                      return (
                        <li key={item.id || linkIndex}>
                          <CMSLink
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            type={link.type}
                            url={link.url}
                            newTab={link.newTab}
                            label={link.label}
                            reference={link.reference}
                            archive={link.archive}
                          />
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Bottom: Copyright */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row sm:justify-between gap-4 text-sm text-muted-foreground">
          {copyright && <span>{copyright}</span>}
          <span>Made with ❤️ and PayloadCMS</span>
        </div>
      </div>
    </footer>
  )
}
