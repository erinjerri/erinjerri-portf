import type { Block } from 'payload'

import { linkGroup } from '../../fields/linkGroup'

export const ProductShowcase: Block = {
  slug: 'productShowcase',
  interfaceName: 'ProductShowcaseBlock',
  labels: {
    singular: 'Product showcase',
    plural: 'Product showcases',
  },
  fields: [
    {
      name: 'screenshot',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'App screenshot shown inside the window frame.',
      },
    },
    {
      name: 'windowLabel',
      type: 'text',
      defaultValue: 'TimeBite',
      admin: {
        description: 'Small label in the window title bar. Leave blank to hide it.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'TimeBite',
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
      defaultValue: 'Make time work for you.',
    },
    {
      name: 'blurb',
      type: 'textarea',
      admin: {
        description: 'One supporting sentence under the headline.',
      },
    },
    linkGroup({
      overrides: {
        maxRows: 2,
        admin: {
          description: 'Primary action, e.g. join the beta.',
        },
      },
    }),
  ],
}
