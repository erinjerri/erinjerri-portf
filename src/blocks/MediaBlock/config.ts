import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

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
      name: 'displayStyle',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'Default (Contained)',
          value: 'default',
        },
        {
          label: 'Full Width Transition',
          value: 'fullWidthTransition',
        },
        {
          label: 'Hero Overlay (image with centered links)',
          value: 'heroOverlay',
        },
      ],
      admin: {
        description: 'Choose how this media block is laid out on the page.',
      },
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      defaultValue: 60,
      min: 0,
      max: 100,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.displayStyle === 'heroOverlay' && siblingData?.mediaType === 'image',
        step: 5,
        description: 'Overlay opacity (0–100). Darkens the image so overlay links are readable.',
      },
    },
    linkGroup({
      overrides: {
        admin: {
          condition: (_, siblingData) =>
            siblingData?.displayStyle === 'heroOverlay' && siblingData?.mediaType === 'image',
          description: "Links overlay the center of the image (e.g. O'Reilly, Amazon).",
        },
        maxRows: 4,
      },
    }),
    {
      name: 'overlayRichText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      admin: {
        condition: (_, siblingData) => siblingData?.mediaType === 'image',
        description:
          "Optional rich text above overlay links when this image is followed by a block with links (e.g. 'Buy').",
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
        return Boolean(value || siblingData?.media) || 'Please select an image.'
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
        return Boolean(value || siblingData?.media) || 'Please select an audio file.'
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => !siblingData?.mediaType,
        description:
          'Legacy field for existing content. Use Image/Video/Audio above for new content.',
      },
    },
  ],
}
