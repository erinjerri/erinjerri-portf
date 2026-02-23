import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'One Third',
        value: 'oneThird',
      },
      {
        label: 'Half',
        value: 'half',
      },
      {
        label: 'Two Thirds',
        value: 'twoThirds',
      },
      {
        label: 'Full',
        value: 'full',
      },
    ],
  },
  {
    name: 'contentType',
    type: 'select',
    defaultValue: 'text',
    options: [
      {
        label: 'Text',
        value: 'text',
      },
      {
        label: 'Media',
        value: 'media',
      },
    ],
    admin: {
      description: 'Choose whether this column renders text or media.',
    },
  },
  {
    name: 'columnStyle',
    type: 'select',
    defaultValue: 'default',
    options: [
      {
        label: 'Default (inherit section style)',
        value: 'default',
      },
      {
        label: 'Black background / White text',
        value: 'blackBgWhiteText',
      },
      {
        label: 'White background / Black text',
        value: 'whiteBgBlackText',
      },
    ],
    admin: {
      description: 'Optional per-column visual override.',
    },
  },
  {
    name: 'whiteStyleMode',
    type: 'select',
    defaultValue: 'boxed',
    options: [
      {
        label: 'Boxed',
        value: 'boxed',
      },
      {
        label: 'Full bleed (to browser edges)',
        value: 'fullBleed',
      },
    ],
    admin: {
      condition: (_, siblingData) => siblingData?.columnStyle === 'whiteBgBlackText',
      description:
        'When using White background / Black text, choose whether it is boxed or full bleed.',
    },
  },
  {
    name: 'richText',
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
    admin: {
      condition: (_, siblingData) => !siblingData?.contentType || siblingData?.contentType === 'text',
    },
    label: false,
  },
  {
    name: 'media',
    type: 'upload',
    relationTo: 'media',
    admin: {
      condition: (_, siblingData) => siblingData?.contentType === 'media',
      description: 'Select an existing media asset or upload a new one.',
    },
  },
  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'contrastStyle',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'White Background / Black Text',
          value: 'whiteOnBlackText',
        },
      ],
      admin: {
        description: 'Set visual contrast for this content block independently of theme mode.',
      },
    },
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
