import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

const devAutosaveInterval = Number(process.env.PAYLOAD_DEV_AUTOSAVE_INTERVAL_MS ?? 15000)

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  lockDocuments: false,
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
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
    defaultColumns: ['title', 'slug', 'crosspostReviewStatus', 'publishedAt', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
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
                    UploadFeature({
                      enabledCollections: ['media'],
                    }),
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
              name: 'relatedPosts',
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
              relationTo: 'posts',
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
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
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
            // If user explicitly set a date, always preserve it
            if (value) return value
            // If there's already a date from a previous save, keep it
            if (originalDoc?.publishedAt) return originalDoc.publishedAt
            // Only auto-set when first publishing with no date at all
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
        description: 'Paste a YouTube, Vimeo, or direct video URL.',
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
      name: 'substackId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Substack post GUID for sync deduplication. Set by sync-substack script.',
        readOnly: true,
      },
    },
    {
      name: 'substackURL',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Original Substack post URL. Set by Substack sync.',
        readOnly: true,
        condition: (data) => Boolean(data?.substackId),
      },
    },
    {
      name: 'crosspostReviewStatus',
      type: 'select',
      admin: {
        position: 'sidebar',
        description: 'Cross-post workflow status for imported Substack posts.',
        condition: (data) => Boolean(data?.substackId),
      },
      options: [
        { label: 'In review', value: 'in_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Auto published', value: 'auto_published' },
      ],
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
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
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      // Autosave disabled: when enabled, it can populate upload nodes in Lexical content with
      // full objects instead of IDs, causing "Upload value should be a string or number" errors.
      // Re-enable when Payload fixes: https://github.com/payloadcms/payload/issues/13643
      autosave: false,
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
