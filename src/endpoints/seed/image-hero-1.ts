import type { Media } from '@/payload-types'

export const imageHero1: Omit<Media, 'createdAt' | 'id' | 'updatedAt'> = {
  mediaType: 'image',
  alt: 'Straight metallic shapes with a blue gradient',
}
