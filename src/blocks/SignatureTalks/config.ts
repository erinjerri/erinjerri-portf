import type { Block } from 'payload'

export const SignatureTalks: Block = {
  slug: 'signatureTalks',
  interfaceName: 'SignatureTalksBlock',
  labels: {
    singular: 'Signature talks',
    plural: 'Signature talks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Signature talks',
    },
    {
      name: 'intro',
      type: 'textarea',
      admin: {
        description: 'Optional paragraph under the heading.',
      },
    },
    {
      name: 'talks',
      type: 'array',
      minRows: 1,
      maxRows: 12,
      labels: {
        singular: 'Talk',
        plural: 'Talks',
      },
      fields: [
        {
          name: 'number',
          type: 'text',
          required: true,
          admin: {
            description: 'Display index e.g. 01, 02',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'subtitle',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
}
