import type { Block } from 'payload'

/**
 * A horizontal rule an editor can place between sections.
 *
 * This used to be drawn automatically between three hardcoded block-type pairs
 * in RenderBlocks, so it appeared in places nobody chose and could not be
 * removed from the admin. It is a block now: visible in the layout list, moved
 * or deleted like anything else.
 */
export const Divider: Block = {
  slug: 'divider',
  interfaceName: 'DividerBlock',
  labels: {
    singular: 'Divider',
    plural: 'Dividers',
  },
  fields: [
    {
      name: 'accent',
      type: 'select',
      defaultValue: 'teal',
      options: [
        { label: 'Teal', value: 'teal' },
        { label: 'Mint', value: 'mint' },
        { label: 'Pink', value: 'pink' },
        { label: 'Neutral', value: 'neutral' },
      ],
      admin: {
        description: 'Line colour. Neutral is a plain hairline with no glow.',
      },
    },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'content',
      options: [
        { label: 'Content width', value: 'content' },
        { label: 'Narrow — matches the stat strip', value: 'narrow' },
        { label: 'Full width', value: 'full' },
      ],
    },
    {
      name: 'spacing',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Tight', value: 'tight' },
        { label: 'Normal', value: 'normal' },
        { label: 'Loose', value: 'loose' },
      ],
      admin: {
        description: 'Space above and below the rule.',
      },
    },
  ],
}
