import type { Page } from '@/payload-types'

/**
 * Default “Hire Me” section for the home page.
 * Seeded so the block is visible on fresh installs, but the content remains editable in Payload.
 */
export const homeHireMeLayoutBlocks: NonNullable<Page['layout']> = [
  {
    blockName: 'Ribbon intro',
    blockType: 'ribbonBlock',
    tagline: "O'Reilly Media Author | Founder & Former Startup CTO | Software Engineer",
    headline:
      'I focus on what happens after the model - when AI has to operate inside products, workflows, and environments.',
    highlight: 'after the model',
    supportingText:
      'My work spans AI, spatial computing, and product systems built for real-world use - across iOS, visionOS, and emerging interfaces.',
    columns: [
      {
        number: '01',
        title: 'AI Agents',
        description: 'Systems that operate beyond chat - executing inside real products and workflows.',
      },
      {
        number: '02',
        title: 'Spatial Computing',
        description: 'AR, VR, and mixed reality interfaces built for visionOS, iOS, and what comes next.',
      },
      {
        number: '03',
        title: 'Product Systems',
        description: 'Architecture and strategy for AI-native products designed to scale in the real world.',
      },
    ],
  },
  {
    blockName: 'Selected highlights',
    blockType: 'statsBlock',
    eyebrow: 'Selected highlights',
    items: [
      {
        value: '#1',
        label: 'Game Programming on Amazon',
        color: 'mint',
      },
      {
        value: '42+',
        label: 'Countries distributed',
        color: 'teal',
      },
      {
        value: '10+',
        label: 'Years in AI, XR, spatial computing',
        color: 'pink',
      },
    ],
  },
  {
    blockName: 'Bio',
    blockType: 'bioBlock',
    eyebrow: "Hi, I'm Erin",
    headline: 'Software engineer, startup founder, and writer - born and raised in Silicon Valley.',
    paragraphs: [
      {
        text: "I've been building in AI, spatial computing, and web3 since 2015.",
        highlights: [
          { phrase: 'AI', color: 'mint', underline: false },
          { phrase: 'spatial computing', color: 'teal', underline: false },
          { phrase: 'web3', color: 'pink', underline: false },
        ],
      },
      {
        text: "I'm the lead author of one of the first comprehensive AR/VR books published by O'Reilly Media in over five years - helping define how engineering, design, and business come together in real systems.",
        highlights: [{ phrase: "O'Reilly Media", color: 'mint', underline: false }],
      },
      {
        text: "I'm a software engineer, startup founder, and former CTO. Right now I'm building TimeBite - along with new books, apps, and film projects.",
        highlights: [{ phrase: 'TimeBite', color: 'teal', underline: false }],
      },
    ],
    pills: [
      { label: 'UC Berkeley Alumna', color: 'mint' },
      { label: 'fast.ai Fellow', color: 'teal' },
      { label: 'AWS CTO Fellowship', color: 'pink' },
      { label: 'FASTER President', color: 'white' },
    ],
  },
]
