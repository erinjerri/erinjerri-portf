import type { Page } from '@/payload-types'
import { defaultBioBlock } from '@/blocks/BioBlock/defaults'

const HOME_SIGNATURE_BLOCK_TYPES = [
  'ribbonBlock',
  'statsBlock',
  'signatureTalks',
  'bioBlock',
] as const
const HOME_EXCLUDED_SPEAKER_BLOCK_TYPES = new Set([
  'speakerKit',
  'speakerBio',
  'speakerBioKit',
  'speakerKitHeadshots',
])

/**
 * Default portfolio sections for the home page.
 * Seeded so the block is visible on fresh installs, but the content remains editable in Payload.
 */
export const homeHireMeLayoutBlocks: NonNullable<Page['layout']> = [
  {
    blockName: 'Ribbon intro',
    blockType: 'ribbonBlock',
    tagline: 'Strategy | Design | Technology',
    headline:
      'I turn ambitious ideas into clear, useful experiences that people can understand and trust.',
    highlight: 'clear, useful experiences',
    supportingText:
      'Replace this copy with a concise statement of what you do, who you help, and why your perspective is different.',
    columns: [
      {
        number: '01',
        title: 'Strategy',
        description:
          'Frame the opportunity, align the team, and define a direction worth pursuing.',
      },
      {
        number: '02',
        title: 'Design',
        description:
          'Turn complex requirements into accessible experiences with a strong point of view.',
      },
      {
        number: '03',
        title: 'Delivery',
        description:
          'Build, test, and ship work that performs reliably outside the presentation deck.',
      },
    ],
  },
  {
    blockName: 'Selected talks',
    blockType: 'signatureTalks',
    heading: 'Selected talks',
    intro: 'Use this section for talks, workshops, podcast topics, or areas of expertise.',
    talks: [
      {
        number: '01',
        title: 'Turning Complexity Into Clarity',
        subtitle: 'A practical approach to making difficult ideas understandable and actionable.',
      },
      {
        number: '02',
        title: 'Designing for Real People',
        subtitle: 'How research, empathy, and iteration create experiences people can trust.',
      },
      {
        number: '03',
        title: 'From Idea to Launch',
        subtitle: 'What it takes to move from an ambitious concept to a resilient product.',
      },
      {
        number: '04',
        title: 'Custom Topic',
        subtitle: 'Tailor this entry to the audience, event, or collaboration you want to attract.',
      },
    ],
  },
  {
    blockName: 'Selected highlights',
    blockType: 'statsBlock',
    eyebrow: 'Selected highlights',
    items: [
      {
        value: '10+',
        label: 'Years of experience',
        color: 'mint',
      },
      {
        value: '25',
        label: 'Projects delivered',
        color: 'teal',
      },
      {
        value: '8',
        label: 'Teams supported',
        color: 'pink',
      },
    ],
  },
  defaultBioBlock({
    eyebrow: 'About',
  }),
]

/**
 * Migration-only helper. Do not call this from the render path: homepage content must come from
 * the CMS after ensure-home-signature-blocks has persisted the signature blocks.
 */
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

    if (blockType && HOME_EXCLUDED_SPEAKER_BLOCK_TYPES.has(blockType)) {
      continue
    }

    otherBlocks.push(block)
  }

  const signatureBlocks = homeHireMeLayoutBlocks.map(
    (seededBlock) => existingSignatureBlocks.get(seededBlock.blockType) ?? seededBlock,
  )

  return [...signatureBlocks, ...otherBlocks]
}
