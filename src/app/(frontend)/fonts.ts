/**
 * Performance: `display: "swap"` + `adjustFontFallback` limit FOIT/CLS; subset + weight list
 * trims bytes vs loading full variable axes.
 */
import { Jost, League_Spartan } from 'next/font/google'

/**
 * Public site typography only: these classes are applied on `<html>` in
 * `src/app/(frontend)/layout.tsx` (`frontendFontVariables`). Payload admin
 * (`src/app/(payload)/layout.tsx`) does not use this file — changing fonts in
 * the CMS admin UI will not affect the marketing site.
 *
 * After changing families here, update the human-readable fallbacks in
 * `globals.css` (`--font-title` / `--font-copy`) so the stack matches.
 */
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

/**
 * Space-separated variable classes for `<html>`.
 * Do not pass this through `tailwind-merge` / `cn()` — hashed names can be mishandled.
 */
export const frontendFontVariables = `${fontJost.variable} ${fontLeagueSpartan.variable}`
