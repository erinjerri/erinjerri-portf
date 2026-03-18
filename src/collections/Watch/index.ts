import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from '../Posts/hooks/populateAuthors'
import { revalidateDelete, revalidateWatch } from './hooks/revalidateWatch'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

const devAutosaveInterval = Number(process.env.PAYLOAD_DEV_AUTOSAVE_INTERVAL_MS ?? 15000)

export const Watch: CollectionConfig = {
  slug: 'watch',
  lockDocuments: false,
  // Use existing MongoDB collection from when slug was 'watches'
  dbName: 'watches',
  labels: {
    plural: 'Videos',
    singular: 'Video',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'publishedAt', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'watch',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'watch',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedWatch',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'watch',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value, originalDoc }) => {
            if (value) return value
            if (originalDoc?.publishedAt) return originalDoc.publishedAt
            if (siblingData._status === 'published') {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    {
      name: 'videoSource',
      type: 'select',
      options: [
        { label: 'Upload', value: 'upload' },
        { label: 'External URL', value: 'url' },
      ],
      defaultValue: 'upload',
      admin: {
        position: 'sidebar',
        description: 'Use an uploaded video or link to an external video.',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.videoSource === 'url',
        description: 'Link to YouTube or any page with a video.',
      },
    },
    {
      name: 'videoAsset',
      type: 'relationship',
      relationTo: 'media',
      filterOptions: {
        mediaType: {
          equals: 'video',
        },
      },
      admin: {
        position: 'sidebar',
        condition: (data) => data?.videoSource !== 'url',
        description: 'Dropdown select for uploaded video assets from Media.',
      },
    },
    {
      name: 'slides',
      type: 'upload',
      relationTo: 'documents',
      admin: {
        position: 'sidebar',
        description: 'Optional PDF slides for this talk. Visitors can view or download.',
      },
    },
    {
      name: 'cardVideoLink',
      type: 'group',
      admin: {
        position: 'sidebar',
        description:
          'Video link shown on the card next to "Download slides". Leave empty to use the external video URL or the watch page.',
      },
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'default',
          options: [
            { label: 'Default (external URL or watch page)', value: 'default' },
            { label: 'Custom URL', value: 'custom' },
            { label: 'Internal page', value: 'reference' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          admin: { condition: (_, siblingData) => siblingData?.type === 'custom' },
          label: 'URL',
        },
        {
          name: 'reference',
          type: 'relationship',
          relationTo: ['pages', 'posts', 'watch'],
          admin: { condition: (_, siblingData) => siblingData?.type === 'reference' },
          label: 'Page to link to',
        },
        {
          name: 'label',
          type: 'text',
          admin: { description: 'Button label (default: "Watch video")' },
          label: 'Label',
        },
        {
          name: 'newTab',
          type: 'checkbox',
          defaultValue: false,
          label: 'Open in new tab',
        },
      ],
    },
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateWatch],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      // Autosave disabled: populates Lexical block uploads with objects instead of IDs, causing
      // "Upload value should be a string or number" errors. Re-enable when fixed upstream.
      autosave: false,
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
