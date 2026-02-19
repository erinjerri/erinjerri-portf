import React from 'react'

import type { Page } from '@/payload-types'

import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import { ToplineHero } from '@/heros/Topline'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
  topline: ToplineHero,
}

export const RenderHero: React.FC<Page['hero']> = (props) => {
  const { type } = props || {}
  const heroType = type as string | undefined

  if (!heroType || heroType === 'none') return null

  const HeroToRender = heroes[heroType as keyof typeof heroes]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
