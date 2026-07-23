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
    text: 'I’m a software engineer, startup founder, and writer, born and raised in Silicon Valley.',
    highlights: [
      { phrase: 'software engineer', color: 'mint', underline: false },
      { phrase: 'startup founder', color: 'teal', underline: false },
      { phrase: 'writer', color: 'pink', underline: false },
    ],
  },
  {
    text: 'I’ve been building in AI, spatial computing, and web3 since 2015.',
    highlights: [
      { phrase: 'AI', color: 'mint', underline: false },
      { phrase: 'spatial computing', color: 'teal', underline: false },
      { phrase: 'web3', color: 'pink', underline: false },
    ],
  },
  {
    text: "I'm widely known as the lead author and co-editor of O’Reilly Media's Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing, which debuted #1 in Amazon’s Game Programming category and has been translated into Chinese and Korean, reaching readers around the world.",
    highlights: [
      { phrase: 'O’Reilly Media', color: 'mint', underline: false },
      { phrase: 'Creating Augmented and Virtual Realities', color: 'teal', underline: false },
      { phrase: '#1 in Amazon’s Game Programming category', color: 'pink', underline: false },
    ],
  },
  {
    text: "I'm a proud UC Berkeley alumnus and was previously a fast.ai deep learning fellow through the University of San Francisco’s Deep Learning program (2017-2018) and Data Ethics inaugural class (2020).",
    highlights: [
      { phrase: 'UC Berkeley', color: 'mint', underline: false },
      { phrase: 'fast.ai', color: 'teal', underline: false },
      { phrase: 'Data Ethics', color: 'pink', underline: false },
    ],
  },
  {
    text: 'Right now, I’m building TimeBite — along with new books, apps, and film projects.',
    highlights: [
      { phrase: 'TimeBite', color: 'teal', underline: false },
      { phrase: 'books, apps, and film projects', color: 'mint', underline: false },
    ],
  },
  {
    text: 'Sign up for my Substack, Creating Your Reality to join the beta.',
    highlights: [
      { phrase: 'Substack', color: 'mint', underline: false },
      { phrase: 'Creating Your Reality', color: 'teal', underline: false },
      { phrase: 'join the beta', color: 'pink', underline: false },
    ],
  },
]

export const defaultBioPills: DefaultBioPill[] = [
  { label: 'Software Engineer', color: 'mint' },
  { label: 'Startup Founder', color: 'teal' },
  { label: 'O’Reilly Author', color: 'pink' },
  { label: 'UC Berkeley Alumna', color: 'mint' },
  { label: 'fast.ai Fellow', color: 'teal' },
  { label: 'TimeBite', color: 'white' },
]

export const defaultBioHeadshot = null

type DefaultBioBlock = Extract<NonNullable<Page['layout']>[number], { blockType: 'bioBlock' }> & {
  headshot?: (string | null) | Media
}

export function defaultBioBlock(overrides: Partial<DefaultBioBlock> = {}): DefaultBioBlock {
  return {
    blockName: 'Bio',
    blockType: 'bioBlock',
    eyebrow: 'Hi, I’m Erin! 👋🏼',
    headline: '',
    headshot: defaultBioHeadshot,
    paragraphs: [...defaultBioParagraphs],
    pills: [...defaultBioPills],
    ...overrides,
  }
}
