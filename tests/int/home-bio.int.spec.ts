import { describe, expect, it } from 'vitest'

import { isDuplicateHomeBiographyText } from '@/blocks/BioBlock/isDuplicateHomeBiographyText'

describe('homepage biography deduplication', () => {
  it('recognizes the current first-name-only duplicate biography', () => {
    expect(
      isDuplicateHomeBiographyText(
        'Hi, I’m Erin! I’m a software engineer, startup founder, and writer. I’ve been building in spatial computing, and right now I’m building TimeBite.',
      ),
    ).toBe(true)
  })

  it('does not hide unrelated homepage content', () => {
    expect(
      isDuplicateHomeBiographyText(
        'What I Build: product systems where AI moves beyond chat and into execution.',
      ),
    ).toBe(false)
  })
})
