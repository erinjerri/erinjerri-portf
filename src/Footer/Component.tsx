import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Footer, Media as MediaType } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { SubscribeForm } from './SubscribeForm'

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
  const fallbackIconPath =
    iconDoc?.filename
      ? `/media/${encodeURI(iconDoc.filename.replace(/^\/+/, ''))}`
      : null

  const iconUrl =
    iconDoc?.url
      ? getMediaUrl(iconDoc.url, iconDoc.updatedAt)
      : fallbackIconPath
        ? getMediaUrl(fallbackIconPath, iconDoc?.updatedAt)
        : null
  const href =
    url.includes('@') && !url.includes('://') && !url.startsWith('mailto:')
      ? `mailto:${url}`
      : url
  const isExternal = href.startsWith('http://') || href.startsWith('https://')

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="text-foreground hover:text-foreground/80 transition-colors"
      aria-label={label}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt=""
          className="h-5 w-5 object-contain"
          width={20}
          height={20}
        />
      ) : (
        <span className="text-sm font-medium">{label.charAt(0)}</span>
      )}
    </Link>
  )
}

export async function Footer() {
  let footerData: Footer | null = null
  try {
    footerData = await getCachedGlobal('footer', 2)()
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Footer] Failed to fetch footer:', err)
    }
    // Fallback so layout still renders if footer query stalls/errors
  }

  const subscribeSection = footerData?.subscribeSection
  const linkGroups = footerData?.linkGroups || []
  const socialLinks = footerData?.socialLinks || []
  const copyright = footerData?.copyright

  const unresolvedIconIDs = socialLinks.flatMap((item) => {
    const icon = item?.icon as unknown
    return typeof icon === 'string' || typeof icon === 'number' ? [icon] : []
  })

  let mediaByID: Record<string, MediaType> = {}

  if (unresolvedIconIDs.length > 0) {
    try {
      const payload = await getPayload({ config: configPromise })
      const mediaResult = await payload.find({
        collection: 'media',
        depth: 0,
        limit: unresolvedIconIDs.length,
        pagination: false,
        where: {
          id: {
            in: unresolvedIconIDs as (string | number)[],
          },
        },
      })

      mediaByID = mediaResult.docs.reduce<Record<string, MediaType>>((acc, mediaDoc) => {
        acc[String(mediaDoc.id)] = mediaDoc as MediaType
        return acc
      }, {})
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Footer] Failed to resolve social icon IDs:', err)
      }
    }
  }

  return (
    <footer className="mt-auto border-t border-border bg-transparent text-foreground">
      <div className="container py-10">
        {/* Main footer content - two columns */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
          {/* Left column: Logo, Subscribe, Slogan, Social */}
          <div className="flex flex-col gap-6 lg:max-w-sm">
            <Link className="flex items-center" href="/">
              <Logo />
            </Link>

            {subscribeSection?.showSubscribe !== false && (
              <SubscribeForm />
            )}

            {subscribeSection?.slogan && (
              <p className="text-sm text-muted-foreground">
                {subscribeSection.slogan}
              </p>
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
                      icon={(() => {
                        const icon = item.icon as unknown
                        return typeof icon === 'string' || typeof icon === 'number'
                          ? (mediaByID[String(icon)] ?? null)
                          : item.icon
                      })()}
                    />
                  ))}
              </div>
            )}

            <ThemeSelector />
          </div>

          {/* Right column: Link groups */}
          {linkGroups.length > 0 && (
            <nav className="flex flex-wrap gap-x-12 gap-y-8">
              {linkGroups.map((group, groupIndex) => (
                <div key={group.id || groupIndex} className="flex flex-col gap-3">
                  {group.header && (
                    <span className="font-semibold text-foreground">
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
          <span>Made with PayloadCMS</span>
        </div>
      </div>
    </footer>
  )
}
