import type { Page } from '@/payload-types'

/**
 * Default “Hire Me” section for the home page.
 * This keeps the block structure in seed data, but the actual copy should live in the
 * Payload CMS page so it can be edited without touching code.
 */
export const homeHireMeLayoutBlocks: NonNullable<Page['layout']> = [
  {
    blockName: 'Hire Me',
    blockType: 'content',
    contrastStyle: 'default',
    columns: [
      {
        contentType: 'text',
        size: 'full',
        enableLink: false,
      },
    ],
  },
  {
    blockName: 'Hero credential strip',
    blockType: 'heroCredentialStrip',
    separator: 'bullet',
    phrases: [
      { text: "O'Reilly author" },
      { text: 'Founder & former CTO' },
      { text: 'AWS, Meta, and Verizon Ventures fellow' },
    ],
  },
  {
    blockName: 'Credibility metrics',
    blockType: 'statStrip',
    columns: 'four',
    emphasis: 'bold',
    items: [
      { value: '#1 Amazon Title', label: "O'Reilly Author" },
      { value: '42+ Countries', label: 'Global Distribution' },
      {
        value: '4 Entrepreneurial Fellowships',
        label: 'AWS CTO Fellowship, Meta/Facebook AR/VR (Oculus) Launchpad, Alley (Verizon Ventures), Gitcoin Kernel',
      },
      { value: '10+ Years', label: 'Building in AI & Spatial Computing' },
    ],
  },
]
