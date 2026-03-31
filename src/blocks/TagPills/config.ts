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
