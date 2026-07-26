import type { Form } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

type Args = {
  speakingRequestForm: Form
}

/** Starter speaker page. Every field remains editable in Payload after seeding. */
export const speakingInfoPage = ({
  speakingRequestForm,
}: Args): RequiredDataFromCollectionSlug<'pages'> => ({
  slug: 'speaking-info',
  _status: 'published',
  title: 'Speaking',
  hero: {
    type: 'none',
  },
  meta: {
    title: 'Speaking — Your Name',
    description: 'Talks, workshops, and speaking information for Your Name.',
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
                  children: [{ type: 'text', text: 'Invite Your Name to speak', version: 1 }],
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
                      text: 'Replace this copy with a concise speaker biography, the audiences you serve, and the outcomes people can expect from your talks.',
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
        { label: 'PODCASTS' },
        { label: 'IN-PERSON' },
        { label: 'VIRTUAL' },
      ],
    },
    {
      blockType: 'signatureTalks',
      blockName: 'Signature talks',
      heading: 'Signature talks',
      intro: 'Replace these starter topics with the ideas you are best equipped to share.',
      talks: [
        {
          number: '01',
          title: 'Turning Complexity Into Clarity',
          subtitle: 'A practical framework for making difficult ideas useful and actionable.',
        },
        {
          number: '02',
          title: 'Designing for Real People',
          subtitle: 'How research, empathy, and iteration create experiences people can trust.',
        },
        {
          number: '03',
          title: 'From Idea to Launch',
          subtitle: 'Lessons from moving ambitious concepts into resilient, real-world products.',
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
})
