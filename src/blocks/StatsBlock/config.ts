import type { Block } from 'payload'

const defaultStats = [
  {
    value: '#1',
    label: 'Game Programming on Amazon',
    color: 'mint',
  },
  {
    value: '42+',
    label: 'Countries distributed',
    color: 'teal',
  },
  {
    value: '10+',
    label: 'Years in AI, XR, spatial computing',
    color: 'pink',
  },
]

export const StatsBlock: Block = {
  slug: 'statsBlock',
  interfaceName: 'StatsBlockBlock',
  labels: {
    singular: 'Stats',
    plural: 'Stats',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'Selected highlights',
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      defaultValue: [...defaultStats],
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
        },
        {
          name: 'color',
          type: 'select',
          defaultValue: 'mint',
          options: [
            { label: 'Mint', value: 'mint' },
            { label: 'Teal', value: 'teal' },
            { label: 'Pink', value: 'pink' },
            { label: 'White', value: 'white' },
          ],
        },
      ],
    },
  ],
}
