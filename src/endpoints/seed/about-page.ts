import type { Form } from '@/payload-types'
import { defaultBioBlock } from '@/blocks/BioBlock/defaults'
import { RequiredDataFromCollectionSlug } from 'payload'

type AboutArgs = {
  speakingRequestForm: Form
}

/**
 * Starter About page with an editable bio and inquiry form.
 */
export const aboutPage = ({
  speakingRequestForm,
}: AboutArgs): RequiredDataFromCollectionSlug<'pages'> => {
  return {
    slug: 'about',
    _status: 'published',
    meta: {
      title: 'About Your Name',
      description: 'Learn more about Your Name, their experience, and the work they care about.',
    },
    title: 'About',
    hero: {
      type: 'none',
    },
    layout: [
      defaultBioBlock(),
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
                    text: 'Work with me',
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
                    text: 'Replace this paragraph with your preferred way to discuss projects, collaborations, or advisory work.',
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
                    text: 'Use the form below for speaking inquiries, workshops, collaborations, or other opportunities.',
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
