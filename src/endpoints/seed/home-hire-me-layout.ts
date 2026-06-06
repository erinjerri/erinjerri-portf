import type { Page } from '@/payload-types'
import { defaultBioBlock } from '@/blocks/BioBlock/defaults'

const HOME_SIGNATURE_BLOCK_TYPES = ['ribbonBlock', 'statsBlock', 'bioBlock'] as const

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
        description:
          'Systems that operate beyond chat - executing inside real products and workflows.',
      },
      {
        number: '02',
        title: 'Spatial Computing',
        description:
          'AR, VR, and mixed reality interfaces built for visionOS, iOS, and what comes next.',
      },
      {
        number: '03',
        title: 'Product Systems',
        description:
          'Architecture and strategy for AI-native products designed to scale in the real world.',
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
  defaultBioBlock({
    eyebrow: 'Hi, I’m Erin! 👋🏼',
  }),
]

export function mergeHomeHireMeLayoutBlocks(
  layout: Page['layout'] | null | undefined,
): NonNullable<Page['layout']> {
  const current = Array.isArray(layout) ? [...layout] : []
  const signatureTypeSet = new Set<string>(HOME_SIGNATURE_BLOCK_TYPES)
  const existingSignatureBlocks = new Map<string, NonNullable<Page['layout']>[number]>()
  const otherBlocks: NonNullable<Page['layout']> = []

  for (const block of current) {
    const blockType = block?.blockType

    if (blockType && signatureTypeSet.has(blockType)) {
      if (!existingSignatureBlocks.has(blockType)) {
        existingSignatureBlocks.set(blockType, block)
      }
      continue
    }

    otherBlocks.push(block)
  }

  const signatureBlocks = homeHireMeLayoutBlocks.map(
    (seededBlock) => existingSignatureBlocks.get(seededBlock.blockType) ?? seededBlock,
  )

  return [...signatureBlocks, ...otherBlocks]
}
