'use client'

import React, { useState } from 'react'

import type { Theme } from '../types'

import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from '../shared'

export const ThemeSelector: React.FC = () => {
  const [value, setValue] = useState('')

  const onThemeChange = (themeToSet: Theme & 'auto') => {
    if (themeToSet === 'auto') {
      window.localStorage.removeItem(themeLocalStorageKey)
      const implicitPreference = getImplicitPreference()
      document.documentElement.setAttribute('data-theme', implicitPreference || defaultTheme)
      setValue('auto')
    } else {
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
      setValue(themeToSet)
    }
  }

  React.useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    setValue(preference ?? 'auto')
  }, [])

  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className="sr-only">Select a theme</span>
      <select
        aria-label="Select a theme"
        className="h-9 rounded-md border border-border bg-transparent px-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
        onChange={(event) => onThemeChange(event.target.value as Theme & 'auto')}
        value={value}
      >
        <option value="auto">Theme: Auto</option>
        <option value="light">Theme: Light</option>
        <option value="dark">Theme: Dark</option>
      </select>
    </label>
  )
}
