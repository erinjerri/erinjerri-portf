import { Jost, League_Spartan } from 'next/font/google'

/** Body / UI copy — self-host via next/font for zero layout shift vs @fontsource. */
export const fontJost = Jost({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  variable: '--font-family-copy',
  weight: ['400', '500', '600', '800'],
})

/** Headings / display — paired with Jost in CSS variables. */
export const fontLeagueSpartan = League_Spartan({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
  variable: '--font-family-title',
  weight: ['400', '500', '600', '800'],
})

/** Apply on `<html>` so `globals.css` can reference `var(--font-family-*)`. */
export const frontendFontVariables = `${fontJost.variable} ${fontLeagueSpartan.variable}`
