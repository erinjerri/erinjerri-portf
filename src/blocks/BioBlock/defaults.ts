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
    text: 'Erin Jerri Malonzo Pañgilinan is a software engineer, startup founder, former CTO, and strategic advisor working at the intersection of AI, spatial computing, and emerging interfaces.',
    highlights: [
      { phrase: 'software engineer', color: 'mint', underline: false },
      { phrase: 'startup founder', color: 'teal', underline: false },
      { phrase: 'former CTO', color: 'pink', underline: false },
      { phrase: 'strategic advisor', color: 'white', underline: false },
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
    text: 'Erin is the founder of TimeBite, an AI-native product that bridges the physical and digital — embedding multimodal intelligence directly into how people interact with and move through the world. Her advisory and speaking work helps leaders reason about platform transitions before they harden into product, architecture, and organizational debt.',
    highlights: [
      { phrase: 'TimeBite', color: 'teal', underline: false },
      { phrase: 'AI-native product', color: 'mint', underline: false },
      { phrase: 'physical and digital', color: 'pink', underline: false },
      { phrase: 'platform transitions', color: 'white', underline: false },
    ],
  },
  {
    text: 'Her work spans AI, spatial computing, and web3, and includes selection into leading technical and entrepreneurial fellowships across these domains, including the Amazon Web Services CTO Fellowship (2022), Gitcoin Kernel (2021), Alley (housed at Verizon Ventures in 2019), and Facebook/Meta’s AR VR/Oculus Launch Pad (2018).',
    highlights: [
      { phrase: 'Amazon Web Services CTO Fellowship', color: 'mint', underline: false },
      { phrase: 'Gitcoin Kernel', color: 'teal', underline: false },
      { phrase: 'AR VR/Oculus Launch Pad', color: 'pink', underline: false },
    ],
  },
  {
    text: 'Erin was a fellow in the deep learning program at the University of San Francisco Data Institute (2017–2018) and the inaugural Data Ethics cohort through fast.ai (2020).',
    highlights: [
      { phrase: 'University of San Francisco Data Institute', color: 'mint', underline: false },
      { phrase: 'Data Ethics', color: 'pink', underline: false },
      { phrase: 'fast.ai', color: 'teal', underline: false },
    ],
  },
  {
    text: 'She earned her BA from University of California, Berkeley and is a Silicon Valley native where early exposure to founders, technologists, and civic leadership shaped her perspective on innovation. Early in her career she spent 5 years working in civic engagement and previously worked as official electoral campaign staff for Obama For America (2012) and Ro Khanna for Congress (2014).',
    highlights: [
      { phrase: 'University of California, Berkeley', color: 'mint', underline: false },
      { phrase: 'Silicon Valley native', color: 'teal', underline: false },
      { phrase: 'civic engagement', color: 'pink', underline: false },
    ],
  },
  {
    text: 'Outside of her professional work, Erin is a seasoned community organizer and advocate. She co-founded 2 non-profit organizations including FASTER (Filipinx American in STEAM), which serves Filipinx Americans working in the tech industry, and ARVR Academy, which focused on expanding access to emerging technologies for women and underrepresented communities. Additionally, she has served on the board of the Silicon Valley Ice Skating Association (SVISA).',
    highlights: [
      { phrase: 'FASTER', color: 'mint', underline: false },
      { phrase: 'ARVR Academy', color: 'teal', underline: false },
      { phrase: 'Silicon Valley Ice Skating Association', color: 'pink', underline: false },
    ],
  },
  {
    text: 'She is currently working on her next apps, books, and films.',
    highlights: [{ phrase: 'apps, books, and films', color: 'teal', underline: false }],
  },
]

export const defaultBioPills: DefaultBioPill[] = [
  { label: 'UC Berkeley Alumna', color: 'mint' },
  { label: 'fast.ai Fellow', color: 'teal' },
  { label: 'AWS CTO Fellowship', color: 'pink' },
  { label: 'Keynote Speaker', color: 'white' },
  { label: 'Systems Architect', color: 'mint' },
  { label: 'FASTER President', color: 'white' },
]

export const defaultBioHeadshot = '/media/erinjerri-book-headshot-green-no-glare-768.webp'

type DefaultBioBlock = Extract<NonNullable<Page['layout']>[number], { blockType: 'bioBlock' }> & {
  headshot?: (string | null) | Media
}

export function defaultBioBlock(
  overrides: Partial<DefaultBioBlock> = {},
): DefaultBioBlock {
  return {
    blockName: 'Bio',
    blockType: 'bioBlock',
    eyebrow: 'Long bio',
    headline: '',
    headshot: defaultBioHeadshot,
    paragraphs: [...defaultBioParagraphs],
    pills: [...defaultBioPills],
    ...overrides,
  }
}
