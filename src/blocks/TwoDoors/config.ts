import type { Block } from 'payload'

/**
 * Two side-by-side offers with one CTA each.
 *
 * Replaces the "Work With Me" / "Speaking" / "Advisory" trio, which spread one
 * decision across three sections and two differently-worded advisory buttons.
 * Two doors, one verb per door, terms stated up front.
 */
export const TwoDoors: Block = {
  slug: 'twoDoors',
  interfaceName: 'TwoDoorsBlock',
  labels: {
    singular: 'Two doors',
    plural: 'Two doors',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'WORK WITH ME',
      admin: { description: 'Rendered as the section heading, in the title face.' },
    },
    {
      name: 'heading',
      type: 'text',
      defaultValue: '',
      admin: {
        description: 'Optional sub-headline under WORK WITH ME. Leave blank for none.',
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      admin: {
        description: 'Optional line under the heading.',
      },
    },
    {
      name: 'doors',
      type: 'array',
      minRows: 1,
      maxRows: 2,
      labels: { singular: 'Door', plural: 'Doors' },
      fields: [
        {
          name: 'kicker',
          type: 'text',
          admin: { description: 'Small uppercase line naming the audience.' },
        },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          filterOptions: { mediaType: { equals: 'image' } },
          admin: {
            description:
              'Optional image above the card copy. Shown at 16:9 — low-resolution sources are fine at this size.',
          },
        },
        { name: 'ctaLabel', type: 'text', required: true },
        { name: 'ctaUrl', type: 'text', required: true },
        {
          name: 'ctaStyle',
          type: 'select',
          defaultValue: 'solid',
          options: [
            { label: 'Solid', value: 'solid' },
            { label: 'Outline', value: 'outline' },
          ],
        },
        {
          name: 'terms',
          type: 'textarea',
          admin: {
            description:
              'Qualifying terms pinned to the bottom of the card, one per line. Stating these up front is what protects the rate.',
          },
        },
      ],
    },
  ],
}
