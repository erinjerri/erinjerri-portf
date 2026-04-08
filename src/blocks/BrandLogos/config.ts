import type { Block } from 'payload'

export const BrandLogos: Block = {
  slug: 'brandLogos',
  interfaceName: 'BrandLogosBlock',
  labels: {
    singular: 'Brand logos',
    plural: 'Brand logos',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Optional section title (e.g. “Trusted by” or “Collaborations”).',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      admin: {
        description: 'Optional line below the heading.',
      },
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'color',
      options: [
        { label: 'Muted (lower opacity)', value: 'muted' },
        { label: 'Full color', value: 'color' },
      ],
    },
    {
      name: 'logos',
      type: 'array',
      minRows: 1,
      labels: {
        singular: 'Logo',
        plural: 'Logos',
      },
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'PNG or SVG on transparent background works best.',
          },
        },
        {
          name: 'href',
          type: 'text',
          admin: {
            description: 'Optional URL when the logo is clicked (https://…).',
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Accessible name if the image has no alt text in Media.',
          },
        },
      ],
    },
  ],
}
