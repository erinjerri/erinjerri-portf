import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'subscribeSection',
      type: 'group',
      label: 'Subscribe Section',
      fields: [
        {
          name: 'slogan',
          type: 'text',
          label: 'Slogan',
        },
        {
          name: 'showSubscribe',
          type: 'checkbox',
          label: 'Show subscribe form',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'linkGroups',
      type: 'array',
      label: 'Footer Link Groups',
      fields: [
        {
          name: 'header',
          type: 'text',
          label: 'Group Header',
        },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          required: true,
          minRows: 1,
          fields: [link({ appearances: false })],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      admin: {
        description: 'Copyright text shown at bottom of footer.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
