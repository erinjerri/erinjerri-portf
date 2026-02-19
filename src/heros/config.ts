import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'Topline',
          value: 'topline',
        },
      ],
      required: true,
    },
    {
      name: 'overlayTitle',
      type: 'text',
      validate: (
        value: unknown,
        { siblingData }: { siblingData?: { type?: 'highImpact' | 'lowImpact' | 'mediumImpact' | 'none' | 'topline' } },
      ) => {
        if (siblingData?.type !== 'topline') return true
        if (typeof value === 'string' && value.trim().length > 0) return true
        return 'Please enter overlay title text.'
      },
      admin: {
        condition: (_, { type } = {}) => type === 'topline',
        description: 'Large white text over the media (example: Experience).',
      },
    },
    {
      name: 'richText',
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
      label: false,
      admin: {
        condition: (_, { type } = {}) => type !== 'topline',
      },
    },
    linkGroup({
      overrides: {
        admin: {
          condition: (_, { type } = {}) => type !== 'topline',
        },
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact', 'topline'].includes(type),
      },
      filterOptions: ({ data }) => {
        if (data?.hero?.type === 'topline') {
          return {
            mediaType: {
              in: ['image', 'video'],
            },
          }
        }

        return true
      },
      relationTo: 'media',
      required: true,
    },
  ],
  label: false,
}
