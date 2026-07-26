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
    text: 'Erin Jerri Malonzo Pañgilinan is a software engineer, startup founder, and former CTO working at the intersection of AI, spatial computing, and web3.',
    highlights: [
      { phrase: 'software engineer', color: 'mint', underline: false },
      { phrase: 'startup founder', color: 'teal', underline: false },
      { phrase: 'former CTO', color: 'pink', underline: false },
    ],
  },
  {
    text: 'She is widely known as the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing (O’Reilly Media), which debuted as the #1 book in Amazon’s Game Programming category and has been translated into Chinese and Korean, with distribution in more than 42 countries.',
    highlights: [
      { phrase: 'Creating Augmented and Virtual Realities', color: 'teal', underline: false },
      { phrase: 'O’Reilly Media', color: 'mint', underline: false },
      { phrase: '#1 book in Amazon’s Game Programming category', color: 'pink', underline: false },
    ],
  },
  {
    text: 'Erin is the founder of TimeBite, an AI-native product that bridges the physical and digital — embedding multimodal intelligence directly into how people interact with and move through the world.',
    highlights: [
      { phrase: 'TimeBite', color: 'teal', underline: false },
      { phrase: 'AI-native product', color: 'mint', underline: false },
      { phrase: 'physical and digital', color: 'pink', underline: false },
    ],
  },
  {
    text: 'Her technical foundation includes fellowships in deep learning at the University of San Francisco Data Institute (2017–2018) and the inaugural Data Ethics cohort through fast.ai (2020). She earned her BA from University of California, Berkeley and is a Silicon Valley native, where early exposure to founders, technologists, and civic leadership shaped her perspective on innovation.',
    highlights: [
      { phrase: 'University of San Francisco Data Institute', color: 'mint', underline: false },
      { phrase: 'fast.ai', color: 'teal', underline: false },
      { phrase: 'Data Ethics', color: 'pink', underline: false },
      { phrase: 'University of California, Berkeley', color: 'mint', underline: false },
      { phrase: 'Silicon Valley native', color: 'teal', underline: false },
    ],
  },
  {
    text: 'Outside of her professional work, Erin is a seasoned community organizer and advocate. She co-founded organizations including FASTER (Filipinx American in STEAM) and ARVR Academy, focused on expanding access to emerging technologies for underrepresented communities, and has served on the board of the Silicon Valley Ice Skating Association (SVISA).',
    highlights: [
      { phrase: 'FASTER', color: 'mint', underline: false },
      { phrase: 'ARVR Academy', color: 'teal', underline: false },
      { phrase: 'Silicon Valley Ice Skating Association', color: 'pink', underline: false },
    ],
  },
]

export const defaultBioPills: DefaultBioPill[] = [
  { label: 'Software Engineer', color: 'mint' },
  { label: 'Startup Founder', color: 'teal' },
  { label: 'Former CTO', color: 'pink' },
  { label: 'O’Reilly Author', color: 'teal' },
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
    eyebrow: 'Bio',
    headline: '',
    headshot: defaultBioHeadshot,
    paragraphs: [...defaultBioParagraphs],
    pills: [...defaultBioPills],
    ...overrides,
  }
}
