import type { Block } from 'payload'

export const BookAcclaimStrip: Block = {
  slug: 'bookAcclaimStrip',
  interfaceName: 'BookAcclaimStripBlock',
  labels: {
    singular: 'Book acclaim strip',
    plural: 'Book acclaim strips',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Book acclaim',
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      labels: {
        singular: 'Item',
        plural: 'Items',
      },
      fields: [
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'text',
          options: [
            { label: 'Numbered (#1, #2)', value: 'numbered' },
            { label: 'Checkmark', value: 'check' },
            { label: 'Plain text', value: 'text' },
          ],
        },
        {
          name: 'lead',
          type: 'text',
          required: true,
          admin: {
            description: 'Bold headline line (e.g. #1 Amazon Game Programming…)',
          },
        },
        {
          name: 'body',
          type: 'textarea',
          admin: {
            description: 'Supporting line under the headline.',
          },
        },
      ],
    },
  ],
}
