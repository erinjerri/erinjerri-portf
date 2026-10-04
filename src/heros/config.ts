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
          label: 'Background Cover',
          value: 'backgroundCover',
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
        { siblingData }: { siblingData?: { type?: 'backgroundCover' | 'highImpact' | 'lowImpact' | 'mediumImpact' | 'none' | 'topline' } },
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
        maxRows: 6,
      },
    }),
    {
      name: 'backgroundMedia',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact' || type === 'backgroundCover',
        description:
          'Background image for high-impact or background-cover heroes. Background Cover uses only this image.',
      },
      filterOptions: () => ({ mediaType: { equals: 'image' } }),
      relationTo: 'media',
      label: 'Background Image',
      validate: (value: unknown, { siblingData }: { siblingData?: { type?: string } }) => {
        if (siblingData?.type === 'backgroundCover') {
          return value != null ? true : 'Background image is required.'
        }
        return true
      },
    },
    {
      name: 'heroImageCount',
      type: 'select',
      defaultValue: '1',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description: 'Choose how many hero images to show on the homepage: one headshot, two portraits, or the full three-image collage.',
      },
      label: 'Hero Image Count',
      options: [
        { label: '1 image (headshot)', value: '1' },
        { label: '2 images', value: '2' },
        { label: '3 images', value: '3' },
      ],
    },
    {
      name: 'introMedia',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description:
          'Primary portrait shown to the right of the high-impact intro copy. This is separate from the three-image work gallery below.',
      },
      filterOptions: () => ({ mediaType: { equals: 'image' } }),
      relationTo: 'media',
      label: 'Intro Portrait (Right Side)',
    },
    {
      name: 'heroImage1',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description:
          'Home: wide top slot in the image collage (row above the two portrait slots). Use with Hero 2 & 3 for a balanced bento layout.',
      },
      filterOptions: () => ({ mediaType: { equals: 'image' } }),
      relationTo: 'media',
      label: 'Hero Image 1 (Top)',
    },
    {
      name: 'heroImage2',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description: 'Home: bottom-left portrait in the collage (e.g. book / headshot). Pairs with Hero 1 & 3.',
      },
      filterOptions: () => ({ mediaType: { equals: 'image' } }),
      relationTo: 'media',
      label: 'Hero Image 2 (Bottom Left)',
    },
    {
      name: 'heroImage3',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => type === 'highImpact',
        description: 'Home: bottom-right portrait in the collage (e.g. AVP / secondary). Pairs with Hero 1 & 2.',
      },
      filterOptions: () => ({ mediaType: { equals: 'image' } }),
      relationTo: 'media',
      label: 'Hero Image 3 (Bottom Right)',
    },
    {
      name: 'productMockup',
      type: 'upload',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'highImpact',
        description:
          'Moved. The product screenshot is now the "Product showcase" block, added under Content like any other section, where its copy, links, and background are editable. This field is no longer rendered and is kept only so the existing image can be migrated. Safe to clear once the block is in place.',
      },
      filterOptions: () => ({ mediaType: { equals: 'image' } }),
      relationTo: 'media',
      label: 'Product Screenshot (TimeBite) — moved to Product showcase block',
    },
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['mediumImpact', 'topline'].includes(type),
        description: 'Main image for the medium-impact/about hero. Topline also uses this media field.',
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
      required: false,
      validate: (
        val: unknown,
        args: { siblingData?: { type?: string } },
      ) => {
        const { siblingData } = args
        if (siblingData?.type === 'mediumImpact' || siblingData?.type === 'topline') {
          return val != null ? true : 'Media is required.'
        }
        return true
      },
    },
  ],
  label: false,
}
