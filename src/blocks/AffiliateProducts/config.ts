import type { Block } from 'payload'

export const AffiliateProductsBlock: Block = {
  slug: 'affiliateProductsBlock',
  interfaceName: 'AffiliateProductsBlock',
  labels: {
    singular: 'Affiliate Products',
    plural: 'Affiliate Products',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'showDisclosure',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Recommended for compliance. Shows an affiliate disclosure line near the product grid.',
      },
    },
    {
      name: 'disclosureText',
      type: 'text',
      defaultValue: 'As an Amazon Associate I earn from qualifying purchases.',
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showDisclosure),
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'affiliateProducts',
      hasMany: true,
      required: true,
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 columns', value: '2' },
        { label: '3 columns', value: '3' },
        { label: '4 columns', value: '4' },
      ],
      admin: {
        description: 'Controls grid columns on desktop. Mobile is always 1 column.',
      },
    },
  ],
}
