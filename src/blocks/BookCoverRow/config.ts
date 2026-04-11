import type { Block } from 'payload'

export const BookCoverRow: Block = {
  slug: 'bookCoverRow',
  interfaceName: 'BookCoverRowBlock',
  labels: {
    singular: 'Book cover row',
    plural: 'Book cover rows',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Optional section title (e.g. “Editions”).',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      admin: {
        description: 'Optional line under the heading.',
      },
    },
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: '2:3',
      options: [
        { label: '2:3 (typical trade cover)', value: '2:3' },
        { label: '3:4 (taller)', value: '3:4' },
      ],
      admin: {
        description:
          'Reserved for future use. Covers render at natural aspect ratio (no dark letterbox frame).',
      },
    },
    {
      name: 'covers',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      labels: {
        singular: 'Cover',
        plural: 'Covers',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Upload a high-resolution cover (e.g. 1200–1600px on the short edge).',
          },
        },
        {
          name: 'caption',
          type: 'text',
          admin: {
            description: 'e.g. English · 中文 · 한국어',
          },
        },
        {
          name: 'buttonLabel',
          type: 'text',
          label: 'Button label',
          admin: {
            description: 'Optional CTA under the cover (e.g. Buy on Amazon).',
          },
        },
        {
          name: 'buttonUrl',
          type: 'text',
          label: 'Button URL',
          admin: {
            description: 'URL for the button when label is set.',
          },
        },
      ],
    },
  ],
}
