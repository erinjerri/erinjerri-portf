'use client'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return

    const isDarkHeaderPath =
      pathname === '/' ||
      pathname === '/watch' ||
      /^\/posts\/[^/]+$/.test(pathname) ||
      /^\/projects\/[^/]+$/.test(pathname) ||
      /^\/watch\/[^/]+$/.test(pathname)

    setTheme(isDarkHeaderPath ? 'dark' : 'light')
  }, [pathname])

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

  const useLightText = scrolled || theme !== 'light'

  return (
    <header
      className={cn(
        // Avoid transition-all: animating text color is not GPU-composited (PageSpeed / jank).
        'sticky top-0 z-50 w-full border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300',
        scrolled
          ? 'bg-[#0a0b10] backdrop-blur-xl border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.35)] text-white'
          : 'bg-transparent border-transparent',
        !scrolled && (useLightText ? 'text-white' : 'text-foreground'),
      )}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container">
        <div className="relative grid h-16 grid-cols-[auto,minmax(0,1fr),auto] items-center gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-6">
          <Link href="/" className="relative z-30 col-start-1 shrink-0 justify-self-start">
            <Logo loading="eager" priority="high" />
          </Link>
          <HeaderNav data={data} scrolled={scrolled} theme={theme} />
        </div>
      </div>
    </header>
  )
}
