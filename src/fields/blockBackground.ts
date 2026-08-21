import type { Block, Field } from 'payload'

/**
 * Every layout block sits on one shared page background, which reads as flat and
 * washed out over a long page. This field lets an editor set a surface per block
 * so sections separate visually.
 *
 * `auto` is the default so pages improve without anyone editing 20 blocks by
 * hand; set an explicit value to override a single section (e.g. force the
 * product showcase onto a light surface).
 */
export const BLOCK_BACKGROUND_VALUES = ['auto', 'default', 'raised', 'light'] as const

export type BlockBackground = (typeof BLOCK_BACKGROUND_VALUES)[number]

export const blockBackgroundField: Field = {
  name: 'background',
  type: 'select',
  defaultValue: 'auto',
  options: [
    { label: 'Auto (alternate with neighbours)', value: 'auto' },
    { label: 'Default (page background)', value: 'default' },
    { label: 'Raised (subtle contrast)', value: 'raised' },
    { label: 'Light (white surface, dark text)', value: 'light' },
  ],
  admin: {
    description:
      'Surface behind this section. Auto alternates with the sections around it. Light is for product screenshots and anything that needs to pop.',
  },
}

/**
 * Appends the background field to a block config. Applied once where blocks are
 * registered rather than edited into every block file, so new blocks pick it up
 * automatically.
 */
export function withBlockBackground(block: Block): Block {
  const alreadyHasField = block.fields.some(
    (field) => 'name' in field && field.name === 'background',
  )

  if (alreadyHasField) return block

  return { ...block, fields: [...block.fields, blockBackgroundField] }
}
