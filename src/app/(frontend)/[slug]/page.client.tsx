'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    /* Home prismatic hero: light nav text on ink background. Other pages: prior default. */
    if (pathname === '/') {
      setHeaderTheme('dark')
      return
    }
    setHeaderTheme('light')
  }, [pathname, setHeaderTheme])

  return <React.Fragment />
}

export default PageClient
