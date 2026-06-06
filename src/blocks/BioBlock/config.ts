import type { Block } from 'payload'

import { defaultBioParagraphs, defaultBioPills } from './defaults'

export const BioBlock: Block = {
  slug: 'bioBlock',
  interfaceName: 'BioBlockBlock',
  labels: {
    singular: 'Bio',
    plural: 'Bio',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'Hi, I’m Erin! 👋🏼',
    },
    {
      name: 'headline',
      type: 'textarea',
      defaultValue: '',
      admin: {
        description:
          'Optional larger headline above the paragraph copy. Leave blank when the bio should be paragraph-driven.',
      },
    },
    {
      name: 'headshot',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mediaType: { equals: 'image' },
      },
      admin: {
        description: 'Optional headshot shown beside the bio copy.',
      },
    },
    {
      name: 'paragraphs',
      type: 'array',
      minRows: 1,
      defaultValue: [...defaultBioParagraphs],
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
        {
          name: 'highlights',
          type: 'array',
          admin: {
            description: 'Optional phrases to highlight inside the paragraph text.',
          },
          fields: [
            {
              name: 'phrase',
              type: 'text',
              required: true,
            },
            {
              name: 'color',
              type: 'select',
              defaultValue: 'mint',
              options: [
                { label: 'Mint', value: 'mint' },
                { label: 'Teal', value: 'teal' },
                { label: 'Pink', value: 'pink' },
                { label: 'White', value: 'white' },
              ],
            },
            {
              name: 'underline',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      name: 'pills',
      type: 'array',
      defaultValue: [...defaultBioPills],
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'color',
          type: 'select',
          defaultValue: 'mint',
          options: [
            { label: 'Mint', value: 'mint' },
            { label: 'Teal', value: 'teal' },
            { label: 'Pink', value: 'pink' },
            { label: 'White', value: 'white' },
          ],
        },
      ],
    },
  ],
}
