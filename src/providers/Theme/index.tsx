'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import type { Theme, ThemeContextType } from './types'

import { defaultTheme, themeLocalStorageKey } from './shared'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(defaultTheme)

  const setTheme = useCallback((_themeToSet: Theme | null) => {
    try {
      window.localStorage.removeItem(themeLocalStorageKey)
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute('data-theme', 'dark')
    setThemeState('dark')
  }, [])

  useEffect(() => {
    try {
      window.localStorage.removeItem(themeLocalStorageKey)
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute('data-theme', 'dark')
    setThemeState('dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ setTheme, theme }}>{children}</ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => useContext(ThemeContext)
