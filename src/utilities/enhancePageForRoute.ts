import type { Page } from '@/payload-types'
import { defaultBioBlock } from '@/blocks/BioBlock/defaults'

function ensureSingleAboutBio(layout: Page['layout']): Page['layout'] {
  const blocks = Array.isArray(layout) ? [...layout] : []
  const blocksWithoutBio = blocks.filter((block) => block?.blockType !== 'bioBlock')
  return [defaultBioBlock(), ...blocksWithoutBio]
}

/**
 * Applies route-level starter defaults while leaving all content editable in Payload.
 */
export function enhancePageForRoute<T extends { layout: Page['layout'] }>(
  page: T,
  slug: string,
): T {
  if (slug !== 'about') return page

  return {
    ...page,
    hero: { type: 'none' },
    layout: ensureSingleAboutBio(page.layout),
  }
}
