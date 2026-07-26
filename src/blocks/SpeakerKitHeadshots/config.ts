import type { Block } from 'payload'

export const SpeakerKitHeadshots: Block = {
  slug: 'speakerKitHeadshots',
  interfaceName: 'SpeakerKitHeadshotsBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Speaker Kit Headshots',
      required: true,
    },
    {
      name: 'photos',
      label: 'Headshot Options',
      type: 'array',
      minRows: 1,
      maxRows: 10,
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          label: 'Credit / Caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'downloadable',
      label: 'Show download button',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
