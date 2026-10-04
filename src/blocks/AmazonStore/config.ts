import type { Block } from 'payload'

export const AmazonStore: Block = {
  slug: 'amazonStore',
  interfaceName: 'AmazonStore',
  labels: {
    singular: 'Amazon Store',
    plural: 'Amazon Store',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Section heading (e.g., "Shop My Favorites")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description under the heading',
      },
    },
    {
      name: 'showFeatured',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show featured products in a prominent section at the top',
      },
    },
    {
      name: 'featuredProducts',
      type: 'relationship',
      relationTo: 'affiliateProducts',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showFeatured),
        description: 'Select 3-5 products to feature prominently. Mark products as "Featured" in the affiliate products collection.',
      },
    },
    {
      name: 'featuredLayout',
      type: 'select',
      defaultValue: 'carousel',
      options: [
        {
          label: 'Carousel (scrollable)',
          value: 'carousel',
        },
        {
          label: 'Grid (2-3 columns)',
          value: 'grid',
        },
      ],
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showFeatured),
        description: 'How to display featured products',
      },
    },
    {
      name: 'showAllProducts',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show full product grid below featured section',
      },
    },
    {
      name: 'allProducts',
      type: 'relationship',
      relationTo: 'affiliateProducts',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.showAllProducts),
        description: 'All products to display in the main grid',
      },
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
        description: 'Product grid columns on desktop',
      },
    },
    {
      name: 'showCategoryTags',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show category/brand tags on product cards',
      },
    },
    {
      name: 'cardStyle',
      type: 'select',
      defaultValue: 'minimal',
      options: [
        {
          label: 'Minimal (clean)',
          value: 'minimal',
        },
        {
          label: 'Full Info (with description)',
          value: 'full',
        },
        {
          label: 'Compact (image + price)',
          value: 'compact',
        },
      ],
      admin: {
        description: 'Product card design style',
      },
    },
    {
      name: 'showDisclosure',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show Amazon affiliate disclosure',
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
  ],
}
