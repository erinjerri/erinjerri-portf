import type { Block } from 'payload'

type MediaBlockSiblingData = {
  media?: unknown
  mediaType?: 'audio' | 'image' | 'video'
  video?: unknown
  videoSource?: 'upload' | 'url'
  videoUrl?: string
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
      label: 'Video Asset',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mediaType: {
          equals: 'video',
        },
      },
      admin: {
        condition: (_, siblingData) =>
          siblingData?.mediaType === 'video' &&
          (siblingData?.videoSource === 'upload' || !siblingData?.videoSource),
        description: 'Choose an existing video asset or create a new one once.',
      },
      validate: (value: unknown, { siblingData }: { siblingData?: MediaBlockSiblingData }) => {
        if (siblingData?.mediaType !== 'video') return true
        if (siblingData?.videoSource === 'url') return true

        return Boolean(value || siblingData?.media) || 'Please select a video.'
      },
    },
    {
      name: 'videoSource',
      type: 'select',
      defaultValue: 'upload',
      options: [
        {
          label: 'Media Library',
          value: 'upload',
        },
        {
          label: 'Video URL',
          value: 'url',
        },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType === 'video',
        description: 'Pick a local video asset or paste a video URL.',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) =>
          siblingData?.mediaType === 'video' && siblingData?.videoSource === 'url',
        description: 'Supports YouTube links and direct .mp4/.webm URLs.',
      },
      validate: (value: unknown, { siblingData }: { siblingData?: MediaBlockSiblingData }) => {
        if (siblingData?.mediaType !== 'video' || siblingData?.videoSource !== 'url') return true
        if (!value || typeof value !== 'string') return 'Please enter a video URL.'

        try {
          const parsedURL = new URL(value)
          if (!parsedURL.protocol.startsWith('http')) {
            return 'Please enter a valid http(s) URL.'
          }

          return true
        } catch {
          return 'Please enter a valid URL.'
        }
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mediaType: {
          equals: 'image',
        },
      },
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType === 'video',
        description: 'Optional poster image for video.',
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
        condition: (_, siblingData) => !siblingData?.mediaType,
        description: 'Legacy field for existing content. Use Image/Video/Audio above for new content.',
      },
    },
  ],
}
