import type { Page } from '@/payload-types'

/**
 * Default “Hire Me” section for the home page.
 * Seeded so the block is visible on fresh installs, but the content remains editable in Payload.
 */
export const homeHireMeLayoutBlocks: NonNullable<Page['layout']> = [
  {
    blockName: 'Hire Me',
    blockType: 'content',
    contrastStyle: 'whiteOnBlackText',
    columns: [
      {
        contentType: 'text',
        size: 'full',
        enableLink: false,
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                tag: 'h2',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Hire Me',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'SOFTWARE ENGINEER · PUBLISHED AUTHOR · SPATIAL COMPUTING PIONEER',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Silicon Valley native building at the intersection of AI, spatial computing, and emerging technology. O’Reilly Media published author, distributed in 42+ countries. Enrolled in UC Berkeley’s Agentic AI program under Professor Dawn Song. Founder & National Board President of FASTER (Filipinx Americans in STEAM).',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      {
        contentType: 'text',
        size: 'half',
        enableLink: true,
        link: {
          type: 'custom',
          appearance: 'default',
          label: 'See topics & request a booking ->',
          url: '/speaking-info',
        },
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                tag: 'h3',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Speaking',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'I keynote at tech conferences, universities, and industry events on AI, spatial computing, and building at the frontier. Past stages include QCon, NVIDIA GTC, Harvard, and UC Berkeley. My O’Reilly book on AR/VR reached 42+ countries.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'I speak to engineers, founders, executives, and students — and I tailor every talk to the room.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      {
        contentType: 'text',
        size: 'half',
        enableLink: true,
        link: {
          type: 'custom',
          appearance: 'outline',
          label: 'Learn more & book a session ->',
          url: '/advisory',
        },
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                tag: 'h3',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Consulting & Advisory',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'High-leverage advisory for founders, product teams, and investors making critical decisions in AI, spatial computing, and emerging technology. Engagements available as single sessions, deep-dive strategy sessions, or ongoing advisory relationships.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
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
