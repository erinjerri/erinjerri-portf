import type { Form } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

type Args = {
  speakingRequestForm: Form
}

/**
 * Speaking / speaker kit page: bio, signature talks, metrics, acclaim, request form.
 * Editable in Payload after seed.
 */
export const speakingInfoPage = ({
  speakingRequestForm,
}: Args): RequiredDataFromCollectionSlug<'pages'> => {
  return {
    slug: 'speaking-info',
    _status: 'published',
    title: 'Speaking',
    hero: {
      type: 'none',
    },
    meta: {
      title: 'Speaking — Erin Jerri Pañgilinan',
      description:
        'Keynotes, panels, and workshops on AI, spatial computing, and building at the frontier. Submit a speaking request.',
    },
    layout: [
      {
        blockType: 'content',
        blockName: 'Speaker intro',
        contrastStyle: 'default',
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
                        text: 'Book Erin Jerri Pañgilinan',
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
                        text: 'Erin Jerri Pañgilinan keynotes at tech conferences, universities, and industry events on AI, spatial computing, and what it means to build at the frontier. She is the lead author of O’Reilly Media’s Creating Augmented and Virtual Realities, distributed in 42+ countries. She is enrolled in UC Berkeley’s Agentic AI program under Professor Dawn Song, is the Founder and National Board President of FASTER (Filipinx Americans in STEAM), and is building a visionOS-native agentic AI application.',
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
        blockType: 'tagPills',
        blockName: 'Availability',
        intro: 'Available for',
        tags: [
          { label: 'KEYNOTES' },
          { label: 'PANELS' },
          { label: 'WORKSHOPS' },
          { label: 'FIRESIDE CHATS' },
          { label: 'IN-PERSON' },
          { label: 'VIRTUAL' },
          { label: 'PAID ENGAGEMENTS ONLY' },
        ],
      },
      {
        blockType: 'signatureTalks',
        blockName: 'Signature talks',
        heading: 'Signature talks',
        intro:
          'Every talk is tailored to the audience. Engineers, founders, executives, and students all need different entry points.',
        talks: [
          {
            number: '01',
            title: 'Agentic AI Is Here. Is Your Product Ready?',
            subtitle:
              "What's actually production-ready vs. hype — and how to build systems that survive real use.",
          },
          {
            number: '02',
            title: 'Spatial Computing After the Hype',
            subtitle:
              'Building for Apple Vision Pro and the XR ecosystem when the rules are still being written.',
          },
          {
            number: '03',
            title: '0→1 in the Age of AI',
            subtitle:
              'How founders make irreversible decisions fast — and which frameworks from the frontier actually hold up.',
          },
          {
            number: '04',
            title: 'The Filipina in the Room',
            subtitle:
              'On being a first-generation Silicon Valley builder, nonprofit founder, and what representation actually costs.',
          },
          {
            number: '05',
            title: "AI Is Not a Feature. It's a Platform Shift.",
            subtitle:
              'Why most teams are integrating AI wrong — and what the interface paradigm actually looks like next.',
          },
          {
            number: '06',
            title: 'Custom Talk Available',
            subtitle:
              'Every talk is tailored to the audience. Engineers, founders, executives, and students all need different entry points.',
          },
        ],
      },
      {
        blockType: 'statStrip',
        blockName: 'Metrics',
        columns: 'four',
        emphasis: 'default',
        items: [
          { value: '42+', label: 'COUNTRIES DISTRIBUTED' },
          { value: '#1', label: 'AMAZON GAME PROGRAMMING' },
          { value: '10K+', label: 'FOLLOWERS ACROSS PLATFORMS' },
          { value: '3', label: 'LANGUAGES: EN · ZH · KO' },
        ],
      },
      {
        blockType: 'bookAcclaimStrip',
        blockName: 'Book acclaim',
        heading: 'Book acclaim',
        items: [
          {
            variant: 'numbered',
            lead: '#1 Amazon Game Programming debut. Translated into Chinese and Korean.',
            body: '',
          },
          {
            variant: 'numbered',
            lead: '#2 BookAuthority Top VR Books to Read of all time.',
            body: '',
          },
          {
            variant: 'check',
            lead: 'Adopted as official curriculum by Univision for VR developers.',
            body: '',
          },
        ],
      },
      {
        blockType: 'tagPills',
        blockName: 'Creds',
        tags: [
          { label: "O'REILLY AUTHOR" },
          { label: 'UC BERKELEY' },
          { label: 'QCON' },
          { label: 'NVIDIA GTC' },
          { label: 'HARVARD' },
          { label: 'APPLE VISION PRO' },
        ],
      },
      {
        blockType: 'content',
        blockName: 'Speaker CTA',
        contrastStyle: 'default',
        columns: [
          {
            contentType: 'text',
            size: 'full',
            enableLink: true,
            link: {
              type: 'custom',
              appearance: 'default',
              label: 'Submit speaking request →',
              url: '#speaking-request-form',
            },
            richText: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'heading',
                    tag: 'h3',
                    children: [{ type: 'text', text: 'Ready to book?', version: 1 }],
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
                        text: 'Use the form below — her team reviews all submissions.',
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
        blockType: 'formBlock',
        blockName: 'Speaking request',
        id: 'speaking-request-form',
        enableIntro: false,
        form: speakingRequestForm,
      },
    ],
  }
}
