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
      label: 'Primary Bio Headshot',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mediaType: { equals: 'image' },
      },
      admin: {
        description:
          'Primary headshot shown beside the bio copy and included first in the Speaker Bio Kit.',
      },
    },
    {
      name: 'speakerHeadshots',
      label: 'Speaker Bio Kit Headshot Options',
      type: 'array',
      maxRows: 8,
      admin: {
        description:
          'Upload or select alternate approved headshots. Visitors can toggle between these images in the Speaker Bio Kit.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: {
            mediaType: { equals: 'image' },
          },
        },
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Short option label, such as “Book headshot” or “Studio portrait”.',
          },
        },
        {
          name: 'caption',
          type: 'textarea',
          admin: {
            description: 'Optional credit, usage note, or description.',
          },
        },
      ],
    },
    {
      name: 'headshotsDownloadable',
      label: 'Allow Speaker Headshot Downloads',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Shows a download link for the selected Speaker Bio Kit headshot.',
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
