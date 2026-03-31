import type { Block } from 'payload'

export const StatStrip: Block = {
  slug: 'statStrip',
  interfaceName: 'StatStripBlock',
  labels: {
    singular: 'Stat strip',
    plural: 'Stat strips',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      admin: {
        description: 'Optional small label above the row.',
      },
    },
    {
      name: 'emphasis',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Bold (book / hero metrics)', value: 'bold' },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: 'four',
      options: [
        { label: 'Four columns', value: 'four' },
        { label: 'Three columns', value: 'three' },
      ],
      admin: {
        description: 'Layout width for metrics or acclaim-style rows.',
      },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      labels: {
        singular: 'Stat',
        plural: 'Stats',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Usually uppercase supporting line.',
          },
        },
      ],
    },
  ],
}
