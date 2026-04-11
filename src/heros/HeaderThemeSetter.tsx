'use client'

import { useTheme } from '@/providers/Theme'
import { useEffect } from 'react'

import type { Theme } from '@/providers/Theme/types'

export function HeaderThemeSetter({ theme }: { theme: Theme | null }) {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(theme)
  }, [setTheme, theme])

  return null
}
