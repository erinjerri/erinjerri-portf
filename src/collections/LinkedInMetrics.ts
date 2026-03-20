import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const LinkedInMetrics: CollectionConfig = {
  slug: 'linkedin-metrics',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['date', 'followers', 'newsletterSubscribers', 'postViews'],
    description: 'LinkedIn follower and engagement metrics synced from the LinkedIn API.',
    group: 'Analytics',
    useAsTitle: 'date',
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        description: 'Date for this metrics snapshot.',
      },
    },
    {
      name: 'followers',
      type: 'number',
      admin: {
        description: 'Total LinkedIn followers.',
      },
    },
    {
      name: 'newsletterSubscribers',
      type: 'number',
      admin: {
        description: 'LinkedIn newsletter subscribers.',
      },
    },
    {
      name: 'postViews',
      type: 'number',
      admin: {
        description: 'Total post views for the period.',
      },
    },
  ],
}
