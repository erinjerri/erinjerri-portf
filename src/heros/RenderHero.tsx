import React from 'react'

import type { Page } from '@/payload-types'

import { BackgroundCoverHero } from '@/heros/BackgroundCover'
import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import { ToplineHero } from '@/heros/Topline'

const heroes = {
  backgroundCover: BackgroundCoverHero,
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
  topline: ToplineHero,
}

export const RenderHero: React.FC<Page['hero'] & { visualVariant?: 'prismatic'; pageSlug?: string }> = (
  props,
) => {
  const { visualVariant, pageSlug, ...heroProps } = props
  const { type } = heroProps || {}
  const heroType = type as string | undefined

  if (!heroType || heroType === 'none') return null

  const HeroToRender = heroes[heroType as keyof typeof heroes]

  if (!HeroToRender) return null

  return (
    <HeroToRender
      {...heroProps}
      {...(heroType === 'highImpact' ? { visualVariant } : {})}
      {...(heroType === 'mediumImpact' && pageSlug ? { pageSlug } : {})}
    />
  )
}
