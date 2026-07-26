import type { Media, Page } from '@/payload-types'

type BioAccentColor = 'mint' | 'teal' | 'pink' | 'white'

type DefaultBioParagraph = {
  text: string
  highlights: {
    phrase: string
    color: BioAccentColor
    underline: boolean
  }[]
}

type DefaultBioPill = {
  label: string
  color: BioAccentColor
}

export const defaultBioParagraphs: DefaultBioParagraph[] = [
  {
    text: 'Your Name is a multidisciplinary creator who turns complex ideas into thoughtful, useful experiences.',
    highlights: [
      { phrase: 'Your Name', color: 'mint', underline: false },
      { phrase: 'multidisciplinary creator', color: 'teal', underline: false },
    ],
  },
  {
    text: 'Their work spans product strategy, design, technology, and storytelling, with an emphasis on craft, clarity, and measurable outcomes.',
    highlights: [
      { phrase: 'product strategy', color: 'mint', underline: false },
      { phrase: 'design', color: 'teal', underline: false },
      { phrase: 'technology', color: 'pink', underline: false },
    ],
  },
  {
    text: 'Use this space to explain the perspective, experience, and values that make your work distinctive. Everything here is editable in Payload CMS.',
    highlights: [{ phrase: 'editable in Payload CMS', color: 'white', underline: false }],
  },
]

export const defaultBioPills: DefaultBioPill[] = [
  { label: 'Strategy', color: 'mint' },
  { label: 'Design', color: 'teal' },
  { label: 'Technology', color: 'pink' },
  { label: 'Speaking', color: 'white' },
]

type DefaultBioBlock = Extract<NonNullable<Page['layout']>[number], { blockType: 'bioBlock' }> & {
  headshot?: (string | null) | Media
}

export function defaultBioBlock(overrides: Partial<DefaultBioBlock> = {}): DefaultBioBlock {
  return {
    blockName: 'Bio',
    blockType: 'bioBlock',
    eyebrow: 'About',
    headline: '',
    paragraphs: [...defaultBioParagraphs],
    pills: [...defaultBioPills],
    ...overrides,
  }
}
