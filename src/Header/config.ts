import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  lockDocuments: false,
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navBackgroundImage',
      type: 'upload',
      admin: {
        description: 'Optional image strip behind the top navigation. Falls back to the built-in dimensions artwork when empty.',
      },
      filterOptions: () => ({ mediaType: { equals: 'image' } }),
      label: 'Navigation Background Image',
      relationTo: 'media',
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Header Links',
      labels: {
        plural: 'Nav Links',
        singular: 'Nav Link',
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 8,
      admin: {
        initCollapsed: false,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
