import React from 'react'

import { DevUnhandledRejectionGuard } from '@/components/DevUnhandledRejectionGuard'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      {process.env.NODE_ENV === 'development' ? <DevUnhandledRejectionGuard /> : null}
      <HeaderThemeProvider>{children}</HeaderThemeProvider>
    </ThemeProvider>
  )
}
