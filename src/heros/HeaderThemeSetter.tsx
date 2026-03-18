'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useEffect } from 'react'

import type { Theme } from '@/providers/Theme/types'

export function HeaderThemeSetter({ theme }: { theme: Theme | null }) {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme(theme)
  }, [setHeaderTheme, theme])

  return null
}
