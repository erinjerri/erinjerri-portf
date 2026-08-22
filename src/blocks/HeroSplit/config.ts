import type { Block } from 'payload'

/**
 * Hero with copy on one side and a portrait image on the other.
 *
 * Exists because the full-bleed hero forces `object-cover` on portrait source
 * art (the Meta Connect photo is 2316x3088), which crops most of the frame and
 * puts text over busy imagery. A split keeps the image at its native aspect and
 * the copy fully legible.
 */
export const HeroSplit: Block = {
  slug: 'heroSplit',
  interfaceName: 'HeroSplitBlock',
  labels: {
    singular: 'Hero (split)',
    plural: 'Hero (split)',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      admin: {
        description: 'Largest line. Keep it short — it sets at display size.',
      },
    },
    {
      name: 'lead',
      type: 'textarea',
      admin: {
        description: 'The claim directly under the headline. One or two sentences.',
      },
    },
    {
      name: 'support',
      type: 'textarea',
      admin: {
        description: 'Smaller supporting paragraph under the lead.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mediaType: { equals: 'image' },
      },
      admin: {
        description:
          'Shown at its native aspect ratio, not cropped to a letterbox. Portrait sources work well here.',
      },
    },
    {
      name: 'imageSide',
      type: 'select',
      defaultValue: 'right',
      options: [
        { label: 'Right', value: 'right' },
        { label: 'Left', value: 'left' },
      ],
    },
    {
      name: 'imageAspect',
      type: 'select',
      defaultValue: '3/4',
      options: [
        { label: 'Portrait 3:4', value: '3/4' },
        { label: 'Portrait 4:5', value: '4/5' },
        { label: 'Square 1:1', value: '1/1' },
        { label: 'Landscape 3:2', value: '3/2' },
      ],
    },
    {
      name: 'ctas',
      type: 'array',
      maxRows: 2,
      labels: { singular: 'Button', plural: 'Buttons' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'solid',
          options: [
            { label: 'Solid', value: 'solid' },
            { label: 'Outline', value: 'outline' },
          ],
        },
      ],
    },
  ],
}
