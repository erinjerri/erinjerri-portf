import type { Block } from 'payload'

export const HeroCredentialStrip: Block = {
  slug: 'heroCredentialStrip',
  interfaceName: 'HeroCredentialStripBlock',
  labels: {
    singular: 'Hero credential strip',
    plural: 'Hero credential strips',
  },
  fields: [
    {
      name: 'phrases',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      labels: {
        singular: 'Phrase',
        plural: 'Phrases',
      },
      defaultValue: [
        { text: "O'Reilly author" },
        { text: 'Founder & former CTO' },
        { text: 'AWS, Meta, and Verizon Ventures fellow' },
      ],
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'separator',
      type: 'select',
      defaultValue: 'bullet',
      options: [
        { label: 'Bullet (•)', value: 'bullet' },
        { label: 'Middot (·)', value: 'middot' },
        { label: 'Pipe (|)', value: 'pipe' },
      ],
      admin: {
        description: 'Separator between the 3 credibility phrases.',
      },
    },
  ],
}
