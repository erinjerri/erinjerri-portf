'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { Menu, SearchIcon, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'

type HeaderLink = NonNullable<HeaderType['navItems']>[number]['link']

const normalizePath = (value: string) => {
  if (value === '/') return '/'
  return value.replace(/\/+$/, '')
}

const resolveHref = (link: HeaderLink): string | null => {
  if (link.type === 'archive' && link.archive) return `/${link.archive}`

  if (
    link.type === 'reference' &&
    link.reference &&
    typeof link.reference.value === 'object' &&
    link.reference.value &&
    'slug' in link.reference.value &&
    link.reference.value.slug
  ) {
    const base = link.reference.relationTo !== 'pages' ? `/${link.reference.relationTo}` : ''
    return `${base}/${link.reference.value.slug}`
  }

  return link.url || null
}

/** When true, use white text (header has dark bg). When false and theme is light, use dark text for contrast on light pages. */
const useLightText = (scrolled: boolean, theme: string | null) =>
  scrolled || theme !== 'light'

export const HeaderNav: React.FC<{
  data: HeaderType | null
  scrolled?: boolean
  theme?: string | null
}> = ({ data, scrolled = false, theme = null }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mounted) return
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mounted, mobileOpen])

  const lightText = useLightText(scrolled, theme ?? null)
  const navLinks = useMemo(
    () => {
      const seen = new Set<string>()

      return navItems
        .map(({ id, link }, i) => ({
          id: id || String(i),
          link,
          href: resolveHref(link),
        }))
        .filter(({ href, id }) => {
          const dedupeKey = normalizePath(href ?? id)
          if (seen.has(dedupeKey)) return false
          seen.add(dedupeKey)
          return true
        })
    },
    [navItems],
  )

  return (
    <>
      {/* Middle column must stay in the grid on mobile (nav is md+ only); display:none would drop the cell. */}
      <div className="col-start-2 row-start-1 flex min-w-0 justify-center justify-self-stretch">
        <nav aria-label="Primary" className="hidden w-full min-w-0 md:flex md:items-center md:justify-center">
          <div
            className={cn(
              'flex max-w-full min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-2 uppercase font-semibold [font-size:var(--nav-font-size)] sm:gap-x-3 md:gap-x-3 md:gap-y-2 md:tracking-[0.14em] lg:gap-x-5 lg:tracking-[0.16em] xl:gap-x-6 xl:tracking-[0.18em] 2xl:gap-x-8',
            )}
          >
            {navLinks.map(({ id, link, href }) => {
              const isActive = href ? normalizePath(pathname ?? '/') === normalizePath(href) : false
              return (
                <span key={id} className="min-w-0 max-w-[min(100%,14rem)] sm:max-w-[min(100%,16rem)]">
                  <CMSLink
                    {...link}
                    prefetch={true}
                    appearance="inline"
                    className={cn(
                      'inline-flex min-h-[44px] w-full items-center justify-center rounded px-2 py-2 text-center leading-snug transition-colors sm:px-2.5 md:justify-center lg:px-3',
                      lightText
                        ? isActive
                          ? 'text-white bg-white/15'
                          : 'text-white/85 hover:text-white hover:bg-white/10'
                        : isActive
                          ? 'text-foreground bg-black/10'
                          : 'text-foreground/85 hover:text-foreground hover:bg-black/5',
                    )}
                  />
                </span>
              )
            })}
          </div>
        </nav>
      </div>
      <div className="col-start-3 row-start-1 flex shrink-0 items-center justify-end justify-self-end">
        <Link
          href="/search"
          className={cn(
            'hidden h-11 w-11 shrink-0 items-center justify-center md:inline-flex transition-colors',
            lightText ? 'text-white/85 hover:text-white' : 'text-foreground/85 hover:text-foreground',
          )}
          aria-label="Search"
        >
          <span className="sr-only">Search</span>
          <SearchIcon className="w-5" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className={cn(
            'shrink-0 p-2 md:hidden',
            lightText ? 'text-white/85 hover:text-white' : 'text-foreground/85 hover:text-foreground',
          )}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {mounted &&
        createPortal(
          <div
            className={cn(
              'md:hidden fixed inset-0 z-[9999] transition-transform duration-300 ease-in-out',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
            )}
            style={{ backgroundColor: '#0a0b10' }}
          >
            <div
              className="absolute inset-0"
              onClick={() => setMobileOpen(false)}
              aria-hidden
              style={{ backgroundColor: '#0a0b10' }}
            />
            <div
              className="relative z-10 flex h-full w-[85%] max-w-sm flex-col border-r border-white/10 p-6 shadow-2xl"
              style={{ backgroundColor: '#0a0b10' }}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-semibold text-white">Menu</span>
                <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={30} className="text-white/85 hover:text-white" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {navLinks.map(({ id, link, href }) => {
                  const isActive =
                    href ? normalizePath(pathname ?? '/') === normalizePath(href) : false

                  return (
                    <div key={id} onClick={() => setMobileOpen(false)}>
                      <CMSLink
                        {...link}
                        prefetch={true}
                        appearance="inline"
                        className={cn(
                          'block rounded-xl px-5 py-3 text-lg uppercase tracking-[0.12em] font-semibold transition-colors',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'text-white hover:bg-white/10',
                        )}
                      />
                    </div>
                  )
                })}

                <Link
                  href="/search"
                  className="mt-4 block rounded-xl px-5 py-3 text-lg uppercase tracking-[0.12em] font-semibold text-white hover:bg-white/10 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Search
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
