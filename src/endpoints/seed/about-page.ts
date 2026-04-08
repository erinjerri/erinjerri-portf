import type { Form } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

type AboutArgs = {
  speakingRequestForm: Form
}

/**
 * About page with speaking request form. Consulting stays on Cal.com — edit the Cal link in the intro in the CMS.
 */
export const aboutPage = ({
  speakingRequestForm,
}: AboutArgs): RequiredDataFromCollectionSlug<'pages'> => {
  return {
    slug: 'about',
    _status: 'published',
    meta: {
      title: 'About Erin Jerri',
      description:
        'Learn more about Erin Jerri, explore speaking topics, and get in touch about consulting or events.',
    },
    title: 'About',
    hero: {
      type: 'none',
    },
    layout: [
      {
        blockType: 'formBlock',
        enableIntro: true,
        form: speakingRequestForm,
        introContent: {
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
                    text: 'Work with Erin',
                    version: 1,
                  },
                ],
                direction: 'ltr' as const,
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
                    text: 'Consulting sessions: book via your Cal.com link (replace this sentence in the admin with the real URL). ',
                    version: 1,
                  },
                ],
                direction: 'ltr' as const,
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
                    text: 'Speaking engagements: use the form below — it is separate from consulting and captures event, budget, and logistics details.',
                    version: 1,
                  },
                ],
                direction: 'ltr' as const,
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    ],
  }
}
