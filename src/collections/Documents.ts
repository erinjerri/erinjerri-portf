import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: {
    singular: 'Document',
    plural: 'Documents',
  },
  admin: {
    group: 'Media',
    description: 'PDF files stored in Cloudflare R2 (or local when R2 is disabled)',
    defaultColumns: ['title', 'category', 'updatedAt'],
    useAsTitle: 'title',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: path.resolve(dirname, '../public/media'),
    mimeTypes: ['application/pdf'],
    adminThumbnail: () => '/favicon.svg',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name (e.g. "Creating AR/VR — Chapter 1")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional short description shown beneath the viewer',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Book', value: 'book' },
        { label: 'Article / Paper', value: 'article' },
        { label: 'Press Kit', value: 'press-kit' },
        { label: 'Slide Deck', value: 'slides' },
        { label: 'Resume / CV', value: 'resume' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'other',
      admin: {
        description: 'Used to filter documents on the front end',
      },
    },
    {
      name: 'allowDownload',
      type: 'checkbox',
      label: 'Allow download',
      defaultValue: true,
      admin: {
        description: 'Show a Download button alongside the viewer',
      },
    },
    {
      name: 'externalEmbedUrl',
      type: 'text',
      label: 'External embed URL (optional)',
      admin: {
        description:
          'Paste an Issuu, Google Drive, or Scribd embed URL to use that viewer instead.',
        placeholder: 'https://e.issuu.com/embed.html#...',
      },
    },
  ],
}
