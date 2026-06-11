import type { Block } from 'payload'

export const SpeakerKit: Block = {
  slug: 'speakerKit',
  interfaceName: 'SpeakerKitBlock',
  fields: [
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'Speaker Kit',
      admin: {
        description: 'Displayed as the section heading',
      },
    },
    {
      name: 'shortBio',
      label: 'Short Bio',
      type: 'textarea',
      required: true,
    },
    {
      name: 'mediumBio',
      label: 'Medium Bio',
      type: 'textarea',
      required: true,
    },
    {
      name: 'longBio',
      label: 'Long Bio',
      type: 'textarea',
      required: true,
    },
    {
      name: 'photoHeading',
      type: 'text',
      defaultValue: 'Speaker Kit Headshots',
    },
    {
      name: 'photos',
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
          type: 'text',
        },
      ],
    },
    {
      name: 'downloadable',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
