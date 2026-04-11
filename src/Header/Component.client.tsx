'use client'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

function themeForPathname(pathname: string): 'dark' | 'light' {
  const isDarkHeaderPath =
    pathname === '/' ||
    pathname === '/watch' ||
    /^\/posts\/[^/]+$/.test(pathname) ||
    /^\/projects\/[^/]+$/.test(pathname) ||
    /^\/watch\/[^/]+$/.test(pathname)

  return isDarkHeaderPath ? 'dark' : 'light'
}

/** Stable row layout — keep identical on server and client first paint. */
const HEADER_ROW_CLASS =
  'relative grid h-16 grid-cols-[auto,minmax(0,1fr),auto] items-center gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-6'

const LOGO_LINK_CLASS = 'relative z-30 col-start-1 shrink-0 justify-self-start'

interface HeaderClientProps {
  data: Header | null
  /** From middleware + headers(); must match first paint before `usePathname` sync. */
  initialPathname: string
}

type HeaderBodyProps = {
  data: Header | null
  pathname: string
  scrolled: boolean
}

const DIMENSIONS_STRIP_SRC =
  '/media/hero-top-banner-experience-dimensions-background-curves-cut-1400x155.png'

/** Pure presentation from props — safe for SSR + first client paint (no scroll/path hooks). */
function HeaderBody({ data, pathname, scrolled }: HeaderBodyProps) {
  const theme = useMemo(() => themeForPathname(pathname), [pathname])
  const keepCurvesWhileSticky = pathname === '/'
  const stripVisible = keepCurvesWhileSticky ? true : !scrolled

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full overflow-hidden border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300',
        scrolled
          ? keepCurvesWhileSticky
            ? 'bg-transparent backdrop-blur-xl border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.35)] text-white'
            : 'bg-[#0a0b10] backdrop-blur-xl border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.35)] text-white'
          : 'bg-transparent border-white/10 text-white',
      )}
      data-theme={theme}
    >
      {stripVisible ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              scrolled
                ? 'linear-gradient(180deg, rgba(5, 10, 22, 0.92) 0%, rgba(7, 13, 26, 0.86) 100%)'
                : 'linear-gradient(180deg, rgba(5, 10, 22, 0.86) 0%, rgba(9, 17, 32, 0.76) 100%)',
              `url(${DIMENSIONS_STRIP_SRC})`,
            ].join(', '),
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
      ) : null}
      <div className="container relative z-10">
        <div className={HEADER_ROW_CLASS}>
          <Link href="/" className={LOGO_LINK_CLASS}>
            <Logo loading="eager" priority="high" />
          </Link>
          <HeaderNav
            data={data}
            pathname={pathname}
            scrolled={scrolled}
            theme={theme}
            stripVisible={stripVisible}
          />
        </div>
      </div>
    </header>
  )
}

/**
 * One stable subtree for SSR and hydration: same `HeaderBody` markup on server and client.
 * Pathname starts as `initialPathname` (from `x-pathname` header) then syncs from `usePathname`.
 * Scroll only toggles cosmetic classes on `<header>` — never swap layout components.
 */
export const HeaderClient: React.FC<HeaderClientProps> = ({ data, initialPathname }) => {
  const pathnameFromHook = usePathname()
  const [pathname, setPathname] = useState(initialPathname)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setPathname(pathnameFromHook ?? initialPathname)
  }, [pathnameFromHook, initialPathname])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return <HeaderBody data={data} pathname={pathname} scrolled={scrolled} />
}
