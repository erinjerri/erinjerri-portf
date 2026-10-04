import type { Block } from 'payload'

export const TagPills: Block = {
  slug: 'tagPills',
  interfaceName: 'TagPillsBlock',
  labels: {
    singular: 'Tag pills',
    plural: 'Tag pills',
  },
  fields: [
    {
      name: 'intro',
      type: 'textarea',
      admin: {
        description: 'Optional line above the tags.',
      },
    },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'subtle',
      options: [
        { label: 'Subtle — accent text on a faint panel', value: 'subtle' },
        { label: 'Solid — accent fill, near-black text', value: 'solid' },
        { label: 'Outline — accent border and text', value: 'outline' },
        { label: 'Deep — dark accent fill, white text', value: 'deep' },
      ],
      admin: {
        description:
          'The palette is pastel (mint, teal, pink), so white text on a plain accent fill is unreadable — roughly 1.3:1. "Solid" therefore pairs the accent fill with near-black text; "Deep" is the white-text option and darkens the fill to carry it.',
      },
    },
    {
      name: 'tags',
      type: 'array',
      minRows: 1,
      labels: {
        singular: 'Tag',
        plural: 'Tags',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
