import type { Media, Page } from '@/payload-types'

import { withPayloadClientRetry } from '@/utilities/getPayloadClient'

type Hero = Page['hero']
type HeroMediaField =
  | Hero['backgroundMedia']
  | Hero['introMedia']
  | Hero['heroImage1']
  | Hero['heroImage2']
  | Hero['heroImage3']
  | Hero['productMockup']
  | Hero['media']
type ResolvedHeroMediaField = string | Media | null | undefined
type ResolveHeroMediaOptions = {
  includeGridMedia?: boolean
}

const isMediaDoc = (value: HeroMediaField): value is Media =>
  Boolean(value && typeof value === 'object' && 'url' in value)

const resolveMedia = async (value: HeroMediaField): Promise<ResolvedHeroMediaField> => {
  if (value == null || isMediaDoc(value)) return value
  if (typeof value !== 'string' && typeof value !== 'number') return value as ResolvedHeroMediaField

  try {
    return await withPayloadClientRetry((payload) =>
      payload.findByID({
        collection: 'media',
        depth: 0,
        id: String(value),
        overrideAccess: false,
      }),
    )
  } catch {
    return String(value)
  }
}

export const resolveHeroMedia = async (
  hero: Hero,
  options: ResolveHeroMediaOptions = {},
): Promise<Hero> => {
  if (!hero) return hero
  const { includeGridMedia = true } = options

  const [backgroundMedia, introMedia, heroImage1, heroImage2, heroImage3, productMockup, media] = await Promise.all([
    resolveMedia(hero.backgroundMedia),
    resolveMedia(hero.introMedia),
    includeGridMedia ? resolveMedia(hero.heroImage1) : Promise.resolve(hero.heroImage1),
    includeGridMedia ? resolveMedia(hero.heroImage2) : Promise.resolve(hero.heroImage2),
    includeGridMedia ? resolveMedia(hero.heroImage3) : Promise.resolve(hero.heroImage3),
    resolveMedia(hero.productMockup),
    resolveMedia(hero.media),
  ])

  return {
    ...hero,
    backgroundMedia,
    introMedia,
    heroImage1,
    heroImage2,
    heroImage3,
    productMockup,
    media,
  }
}
