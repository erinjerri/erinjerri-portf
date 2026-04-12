import type { Block } from 'payload'

const defaultRibbonColumns = [
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
]

export const RibbonBlock: Block = {
  slug: 'ribbonBlock',
  interfaceName: 'RibbonBlockBlock',
  labels: {
    singular: 'Ribbon intro',
    plural: 'Ribbon intros',
  },
  fields: [
    {
      name: 'tagline',
      type: 'text',
      defaultValue: "O'Reilly Media Author | Founder & Former Startup CTO | Software Engineer",
    },
    {
      name: 'headline',
      type: 'textarea',
      required: true,
      defaultValue:
        'I focus on what happens after the model - when AI has to operate inside products, workflows, and environments.',
    },
    {
      name: 'highlight',
      type: 'text',
      admin: {
        description: 'Optional exact phrase inside the headline to highlight in mint italic.',
      },
      defaultValue: 'after the model',
    },
    {
      name: 'supportingText',
      type: 'textarea',
      defaultValue:
        'My work spans AI, spatial computing, and product systems built for real-world use - across iOS, visionOS, and emerging interfaces.',
    },
    {
      name: 'columns',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      defaultValue: [...defaultRibbonColumns],
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
}
