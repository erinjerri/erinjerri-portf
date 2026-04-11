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

/** Pure presentation from props — safe for SSR + first client paint (no scroll/path hooks). */
function HeaderBody({ data, pathname, scrolled }: HeaderBodyProps) {
  const theme = useMemo(() => themeForPathname(pathname), [pathname])
  const useLightText = scrolled || theme !== 'light'

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300',
        scrolled
          ? 'bg-[#0a0b10] backdrop-blur-xl border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.35)] text-white'
          : 'bg-transparent border-transparent',
        !scrolled && (useLightText ? 'text-white' : 'text-foreground'),
      )}
      data-theme={theme}
    >
      <div className="container">
        <div className={HEADER_ROW_CLASS}>
          <Link href="/" className={LOGO_LINK_CLASS}>
            <Logo loading="eager" priority="high" />
          </Link>
          <HeaderNav data={data} pathname={pathname} scrolled={scrolled} theme={theme} />
        </div>
      </div>
    </header>
  )
}

function HeaderBodyInteractive({ data, initialPathname }: HeaderClientProps) {
  const [scrolled, setScrolled] = useState(false)
  const pathnameFromHook = usePathname()
  const [pathname, setPathname] = useState(initialPathname)

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

/**
 * First paint uses only `initialPathname` + no scroll hooks so SSR HTML matches the client.
 * After mount, swap to the interactive subtree — it mounts fresh and is not re-hydrated against
 * a different legacy bundle / `usePathname` timing mismatch.
 */
export const HeaderClient: React.FC<HeaderClientProps> = ({ data, initialPathname }) => {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <HeaderBody data={data} pathname={initialPathname} scrolled={false} />
  }

  return <HeaderBodyInteractive data={data} initialPathname={initialPathname} />
}
