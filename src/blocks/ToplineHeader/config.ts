import type { Block } from 'payload'

export const ToplineHeader: Block = {
  slug: 'toplineHeader',
  interfaceName: 'ToplineHeaderBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Large white text over the media banner, e.g. "Experience".',
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: {
        mediaType: {
          in: ['image', 'video'],
        },
      },
      admin: {
        description: 'Select a background image or video asset.',
      },
    },
    {
      name: 'height',
      type: 'select',
      defaultValue: 'medium',
      options: [
        {
          label: 'Small',
          value: 'small',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'Large',
          value: 'large',
        },
      ],
    },
  ],
}
