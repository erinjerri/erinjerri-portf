import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'

export const AffiliateProducts: CollectionConfig<'affiliateProducts'> = {
  slug: 'affiliateProducts',
  lockDocuments: false,
  labels: {
    singular: 'Affiliate Product',
    plural: 'Affiliate Products',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'brand', 'createdAt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'brand',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'productURL',
      type: 'text',
      required: true,
      admin: {
        description:
          'Paste an Amazon product URL (or any URL). The site will append your Amazon Associates tag at render-time when applicable.',
      },
    },
    {
      name: 'asin',
      type: 'text',
      admin: {
        description: 'Optional. Amazon ASIN, useful for your own bookkeeping.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'View on Amazon',
    },
    {
      name: 'openInNewTab',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}

