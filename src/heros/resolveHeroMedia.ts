import type { Media, Page } from '@/payload-types'

import { getPayloadClient } from '@/utilities/getPayloadClient'

type Hero = Page['hero']
type HeroMediaField = Hero['backgroundMedia'] | Hero['heroImage1'] | Hero['heroImage2'] | Hero['heroImage3'] | Hero['media']
type ResolvedHeroMediaField = string | Media | null | undefined

const isMediaDoc = (value: HeroMediaField): value is Media =>
  Boolean(value && typeof value === 'object' && 'url' in value)

const resolveMedia = async (value: HeroMediaField): Promise<ResolvedHeroMediaField> => {
  if (value == null || isMediaDoc(value)) return value
  if (typeof value !== 'string' && typeof value !== 'number') return value as ResolvedHeroMediaField

  try {
    const payload = await getPayloadClient()
    return await payload.findByID({
      collection: 'media',
      depth: 0,
      id: String(value),
      overrideAccess: false,
    })
  } catch {
    return String(value)
  }
}

export const resolveHeroMedia = async (hero: Hero): Promise<Hero> => {
  if (!hero) return hero

  const [backgroundMedia, heroImage1, heroImage2, heroImage3, media] = await Promise.all([
    resolveMedia(hero.backgroundMedia),
    resolveMedia(hero.heroImage1),
    resolveMedia(hero.heroImage2),
    resolveMedia(hero.heroImage3),
    resolveMedia(hero.media),
  ])

  return {
    ...hero,
    backgroundMedia,
    heroImage1,
    heroImage2,
    heroImage3,
    media,
  }
}
