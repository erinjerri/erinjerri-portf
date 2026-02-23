import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const VideoBackgroundTransition: Block = {
  slug: 'videoBackgroundTransition',
  interfaceName: 'VideoBackgroundTransitionBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: {
        mediaType: {
          in: ['video', 'image'],
        },
      },
      admin: {
        description: 'Choose a background video (or image fallback).',
      },
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      defaultValue: 80,
      min: 0,
      max: 100,
      admin: {
        step: 5,
        description: 'Overlay opacity percentage. 80 gives a strong transition effect.',
      },
    },
    {
      name: 'height',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Optional Overlay Content',
    },
  ],
  labels: {
    singular: 'Video Background Transition',
    plural: 'Video Background Transitions',
  },
}
