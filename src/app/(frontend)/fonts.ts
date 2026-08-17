import localFont from 'next/font/local'

/**
 * Fonts are bundled with the application rather than fetched from a third
 * party at build or render time. This keeps the public site visually
 * consistent in local development and in production.
 */
const leagueSpartan = localFont({
  src: './fonts/LeagueSpartan-Variable.woff2',
  variable: '--font-league-spartan',
  weight: '200 900',
  display: 'swap',
})

const satoshi = localFont({
  src: [
    { path: './fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Satoshi-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

export const frontendFontVariables = `${leagueSpartan.variable} ${satoshi.variable}`
