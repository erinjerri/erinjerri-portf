import type { Block } from 'payload'

const defaultParagraphs = [
  {
    text: "I've been building in AI, spatial computing, and web3 since 2015.",
    highlights: [
      { phrase: 'AI', color: 'mint', underline: false },
      { phrase: 'spatial computing', color: 'teal', underline: false },
      { phrase: 'web3', color: 'pink', underline: false },
    ],
  },
  {
    text: "I'm the lead author of one of the first comprehensive AR/VR books published by O'Reilly Media in over five years - helping define how engineering, design, and business come together in real systems.",
    highlights: [{ phrase: "O'Reilly Media", color: 'mint', underline: false }],
  },
  {
    text: "I'm a software engineer, startup founder, and former CTO. Right now I'm building TimeBite - along with new books, apps, and film projects.",
    highlights: [{ phrase: 'TimeBite', color: 'teal', underline: false }],
  },
]

const defaultPills = [
  { label: 'UC Berkeley Alumna', color: 'mint' },
  { label: 'fast.ai Fellow', color: 'teal' },
  { label: 'AWS CTO Fellowship', color: 'pink' },
  { label: 'FASTER President', color: 'white' },
]

export const BioBlock: Block = {
  slug: 'bioBlock',
  interfaceName: 'BioBlockBlock',
  labels: {
    singular: 'Bio',
    plural: 'Bio',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: "Hi, I'm Erin",
    },
    {
      name: 'headline',
      type: 'textarea',
      required: true,
      defaultValue:
        'Software engineer, startup founder, and writer - born and raised in Silicon Valley.',
    },
    {
      name: 'paragraphs',
      type: 'array',
      minRows: 1,
      defaultValue: [...defaultParagraphs],
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
        {
          name: 'highlights',
          type: 'array',
          admin: {
            description: 'Optional phrases to highlight inside the paragraph text.',
          },
          fields: [
            {
              name: 'phrase',
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
            {
              name: 'underline',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      name: 'pills',
      type: 'array',
      defaultValue: [...defaultPills],
      fields: [
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
