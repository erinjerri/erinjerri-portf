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
    text: 'Erin Jerri Malonzo Pañgilinan is a proud Silicon Valley native born and raised software engineer, startup founder, former CTO, author, and speaker working at the intersection of artificial intelligence, spatial computing, and emerging interfaces.',
    highlights: [
      { phrase: 'Silicon Valley native', color: 'white', underline: false },
      { phrase: 'software engineer', color: 'mint', underline: false },
      { phrase: 'startup founder', color: 'teal', underline: false },
      { phrase: 'former CTO', color: 'pink', underline: false },
    ],
  },
  {
    text: 'She is the lead author of Creating Augmented and Virtual Realities: Theory and Practice for Next-Generation Spatial Computing (O’Reilly Media), which debuted as the #1 new release in Amazon’s Game Programming category, has been translated into Chinese and Korean, is distributed in more than 42 countries, and became widely known within the XR community as the “VR Bible.”',
    highlights: [
      { phrase: 'Creating Augmented and Virtual Realities', color: 'teal', underline: false },
      { phrase: 'O’Reilly Media', color: 'mint', underline: false },
      {
        phrase: '#1 new release in Amazon’s Game Programming category',
        color: 'pink',
        underline: false,
      },
      { phrase: '“VR Bible”', color: 'white', underline: false },
    ],
  },
  {
    text: 'Erin is the founder of TimeBite, an AI-native platform currently in beta on Apple platforms, that helps people better understand how they spend their time and align daily actions with long-term goals.',
    highlights: [
      { phrase: 'TimeBite', color: 'teal', underline: false },
      { phrase: 'AI-native platform', color: 'mint', underline: false },
      { phrase: 'beta on Apple platforms', color: 'pink', underline: false },
    ],
  },
  {
    text: 'Her technical background includes selection into leading engineering and entrepreneurial programs, including the Amazon Web Services CTO Fellowship (2022), Gitcoin Kernel (2021), Verizon Ventures’ Alley program (2019), Meta’s Oculus Launch Pad (2018), the University of San Francisco Data Institute’s Deep Learning Fellowship (2017–2018), the inaugural Data Ethics program through fast.ai (2020), and Venture Forward through the National Venture Capital Association (NVCA) and UC Berkeley Executive Law Program (2025).',
    highlights: [
      { phrase: 'Amazon Web Services CTO Fellowship', color: 'mint', underline: false },
      { phrase: 'Gitcoin Kernel', color: 'teal', underline: false },
      { phrase: 'Meta’s Oculus Launch Pad', color: 'pink', underline: false },
      { phrase: 'Venture Forward', color: 'white', underline: false },
    ],
  },
  {
    text: 'Erin earned her B.A. from the University of California, Berkeley.',
    highlights: [{ phrase: 'University of California, Berkeley', color: 'mint', underline: false }],
  },
  {
    text: 'Early in her career, she spent more than seven years as a journalist and more than five years in civic engagement, including paid campaign staff for Obama for America (2012) and Ro Khanna for Congress (2014).',
    highlights: [
      { phrase: 'seven years as a journalist', color: 'teal', underline: false },
      { phrase: 'civic engagement', color: 'pink', underline: false },
      { phrase: 'Obama for America', color: 'white', underline: false },
    ],
  },
  {
    text: 'She co-founded two nonprofit organizations — FASTER (Filipinx Americans in STEAM), which supports Filipinx American professionals in tech, and ARVR Academy, which focused on increasing representation of women in immersive technology — and has served on the board of the Silicon Valley Ice Skating Association (SVISA)',
    highlights: [
      { phrase: 'FASTER', color: 'mint', underline: false },
      { phrase: 'ARVR Academy', color: 'teal', underline: false },
      { phrase: 'Silicon Valley Ice Skating Association', color: 'pink', underline: false },
    ],
  },
  {
    text: 'Today, Erin builds AI-native products, advises founders on AI and spatial computing, and is developing new books, film, and television projects.',
    highlights: [
      { phrase: 'AI-native products', color: 'mint', underline: false },
      { phrase: 'advises founders', color: 'teal', underline: false },
      { phrase: 'books, film, and television projects', color: 'pink', underline: false },
    ],
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

export function defaultBioBlock(overrides: Partial<DefaultBioBlock> = {}): DefaultBioBlock {
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
