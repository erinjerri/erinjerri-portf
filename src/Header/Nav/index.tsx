'use client'

import React, { useEffect, useMemo, useState } from 'react'

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

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navLinks = useMemo(
    () =>
      navItems.map(({ id, link }, i) => ({
        id: id || String(i),
        link,
        href: resolveHref(link),
      })),
    [navItems],
  )

  return (
    <nav className="relative flex w-full items-center justify-center">
      <div className="hidden md:flex items-center justify-center gap-8 uppercase tracking-[0.18em] text-[11px] md:text-xs font-semibold">
        {navLinks.map(({ id, link, href }) => {
          const isActive = href ? normalizePath(pathname) === normalizePath(href) : false

          return (
            <CMSLink
              key={id}
              {...link}
              appearance="inline"
                  className={cn(
                    'rounded px-3 py-2 transition-colors font-semibold',
                isActive ? 'text-white bg-white/15' : 'text-white/85 hover:text-white hover:bg-white/10',
              )}
            />
          )
        })}
      </div>
      <Link
        href="/search"
        className="absolute right-12 hidden md:inline-flex text-white/85 hover:text-white transition-colors"
        aria-label="Search"
      >
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5" />
      </Link>
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        className="absolute right-0 md:hidden text-white/85 hover:text-white p-2 rounded-md transition-colors"
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className="relative h-full w-4/5 max-w-sm bg-background/95 backdrop-blur-2xl border-r border-white/15 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-semibold text-white">Menu</span>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={30} className="text-white/85 hover:text-white" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {navLinks.map(({ id, link, href }) => {
              const isActive = href ? normalizePath(pathname) === normalizePath(href) : false

              return (
                <CMSLink
                  key={id}
                  {...link}
                  appearance="inline"
                  className={cn(
                    'rounded-xl px-5 py-3 text-lg uppercase tracking-[0.12em] font-semibold transition-colors',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )}
                />
              )
            })}

            <Link
              href="/search"
              className="mt-4 rounded-xl px-5 py-3 text-lg uppercase tracking-[0.12em] font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Search
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
