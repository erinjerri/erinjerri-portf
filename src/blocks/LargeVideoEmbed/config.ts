import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

type LargeVideoEmbedSiblingData = {
  videoSource?: 'upload' | 'url'
  videoUrl?: string
  video?: unknown
}

export const LargeVideoEmbed: Block = {
  slug: 'largeVideoEmbed',
  interfaceName: 'LargeVideoEmbed',
  fields: [
    {
      name: 'videoSource',
      type: 'select',
      required: true,
      defaultValue: 'url',
      options: [
        {
          label: 'Video URL',
          value: 'url',
        },
        {
          label: 'Media Library Upload',
          value: 'upload',
        },
      ],
      admin: {
        description: 'Choose whether to use a video URL or upload from the media library.',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.videoSource === 'url',
        description: 'Paste a video URL (YouTube, Vimeo, or direct .mp4/.webm links supported).',
      },
      validate: (value: unknown, { siblingData }: { siblingData?: LargeVideoEmbedSiblingData }) => {
        if (siblingData?.videoSource !== 'url') return true
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
        condition: (_, siblingData) => siblingData?.videoSource === 'upload',
        description: 'Select a video from the media library.',
      },
      validate: (value: unknown, { siblingData }: { siblingData?: LargeVideoEmbedSiblingData }) => {
        if (siblingData?.videoSource !== 'upload') return true
        return Boolean(value) || 'Please select a video.'
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
        description: 'Optional poster image for the video (shows before playback).',
      },
    },
    {
      name: 'overlayText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      admin: {
        description: 'Optional text to overlay centered on the video.',
      },
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      defaultValue: 40,
      min: 0,
      max: 100,
      admin: {
        step: 5,
        description:
          'Background overlay opacity (0–100) to improve text readability. Darkens the video behind overlay text.',
      },
    },
    {
      name: 'heightVariant',
      type: 'select',
      defaultValue: 'standard',
      options: [
        {
          label: 'Standard (60vh)',
          value: 'standard',
        },
        {
          label: 'Large (70vh)',
          value: 'large',
        },
        {
          label: 'Extra Large (80vh)',
          value: 'extraLarge',
        },
      ],
      admin: {
        description: 'Choose the height of the video section.',
      },
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Automatically play video when section comes into view.',
      },
    },
    {
      name: 'loop',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Loop video playback continuously.',
      },
    },
    {
      name: 'muted',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Mute video audio (required for autoplay in most browsers).',
      },
    },
  ],
}
