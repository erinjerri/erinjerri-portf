import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { AffiliateProductsBlock } from '../../blocks/AffiliateProducts/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { DocumentBlock } from '../../blocks/DocumentBlock/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { ToplineHeader } from '../../blocks/ToplineHeader/config'
import { VideoBackgroundTransition } from '../../blocks/VideoBackgroundTransition/config'
import { WatchBlock } from '../../blocks/WatchBlock/config'
import { StatStrip } from '../../blocks/StatStrip/config'
import { TagPills } from '../../blocks/TagPills/config'
import { BrandLogos } from '../../blocks/BrandLogos/config'
import { BookCoverRow } from '../../blocks/BookCoverRow/config'
import { HeroCredentialStrip } from '../../blocks/HeroCredentialStrip/config'
import { SignatureTalks } from '../../blocks/SignatureTalks/config'
import { BookAcclaimStrip } from '../../blocks/BookAcclaimStrip/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

const devAutosaveInterval = Number(process.env.PAYLOAD_DEV_AUTOSAVE_INTERVAL_MS ?? 15000)

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  lockDocuments: false,
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
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
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                CallToAction,
                Content,
                DocumentBlock,
                MediaBlock,
                Archive,
                AffiliateProductsBlock,
                WatchBlock,
                VideoBackgroundTransition,
                FormBlock,
                ToplineHeader,
                StatStrip,
                TagPills,
                BrandLogos,
                BookCoverRow,
                HeroCredentialStrip,
                SignatureTalks,
                BookAcclaimStrip,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
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
        position: 'sidebar',
      },
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
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave:
        process.env.NODE_ENV === 'development'
          ? { interval: Number.isFinite(devAutosaveInterval) ? devAutosaveInterval : 15000 }
          : { interval: 5000 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
