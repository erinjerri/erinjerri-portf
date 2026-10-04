/**
 * The brand accent palette, single source of truth.
 *
 * These values originate in the biography block, which has always been the
 * canonical expression of the palette — mint / teal / pink picked up from the
 * ribbon artwork. Blocks used to hardcode an unrelated gold; they don't now.
 *
 * Buttons use the theme tokens instead (`primary` = cobalt, `accent` = light
 * blue) so they stay in step with the logo and with the Brand global in Payload.
 */
export const BRAND_ACCENTS = {
  mint: '#9ff0bd',
  teal: '#78e7df',
  pink: '#f3b0d2',
  white: 'rgba(255,255,255,0.92)',
} as const

export type BrandAccentColor = keyof typeof BRAND_ACCENTS

/** Rotation order for repeated elements (pills, kickers, numbered items). */
export const ACCENT_CYCLE: BrandAccentColor[] = ['teal', 'mint', 'pink']

/** Pick a palette colour by index, wrapping — keeps sequences visually varied. */
export function accentForIndex(index: number): string {
  const key = ACCENT_CYCLE[index % ACCENT_CYCLE.length] ?? 'teal'
  return BRAND_ACCENTS[key]
}
