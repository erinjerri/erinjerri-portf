'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
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
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

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
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        scrolled
          ? 'bg-[#0a0b10] backdrop-blur-xl border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.35)] text-white'
          : 'bg-transparent border-transparent',
        !scrolled && (useLightText ? 'text-white' : 'text-foreground'),
      )}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container">
        <div className="relative flex h-16 items-center justify-center">
          <Link href="/" className="absolute left-0 top-1/2 -translate-y-1/2 z-30">
            <Logo loading="eager" priority="high" />
          </Link>
          <HeaderNav data={data} scrolled={scrolled} theme={theme} />
        </div>
      </div>
    </header>
  )
}
