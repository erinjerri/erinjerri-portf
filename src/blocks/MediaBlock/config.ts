import type { Block } from 'payload'

type MediaBlockSiblingData = {
  mediaType?: 'audio' | 'image' | 'video'
}

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'mediaType',
      type: 'select',
      required: true,
      defaultValue: 'image',
      options: [
        {
          label: 'Image',
          value: 'image',
        },
        {
          label: 'Video',
          value: 'video',
        },
        {
          label: 'Audio',
          value: 'audio',
        },
      ],
      admin: {
        description: 'Choose which kind of media to insert into this block.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mediaType: {
          equals: 'image',
        },
      },
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType === 'image',
      },
      validate: (value: unknown, { siblingData }: { siblingData?: MediaBlockSiblingData }) => {
        if (siblingData?.mediaType !== 'image') return true
        return Boolean(value) || 'Please select an image.'
      },
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mediaType: {
          equals: 'video',
        },
      },
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType === 'video',
      },
      validate: (value: unknown, { siblingData }: { siblingData?: MediaBlockSiblingData }) => {
        if (siblingData?.mediaType !== 'video') return true
        return Boolean(value) || 'Please select a video.'
      },
    },
    {
      name: 'audio',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mediaType: {
          equals: 'audio',
        },
      },
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType === 'audio',
      },
      validate: (value: unknown, { siblingData }: { siblingData?: MediaBlockSiblingData }) => {
        if (siblingData?.mediaType !== 'audio') return true
        return Boolean(value) || 'Please select an audio file.'
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Legacy field for existing content. Use Image/Video/Audio above for new content.',
      },
    },
  ],
}
