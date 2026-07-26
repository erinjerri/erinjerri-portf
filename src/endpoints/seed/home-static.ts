import type { RequiredDataFromCollectionSlug } from 'payload'

import { homeHireMeLayoutBlocks } from './home-hire-me-layout'

// Used during builds when the database has not been seeded yet.
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  title: 'Home',
  hero: {
    type: 'highImpact',
    links: [
      {
        link: {
          type: 'custom',
          appearance: 'default',
          label: 'View my work',
          url: '/projects',
        },
      },
      {
        link: {
          type: 'custom',
          appearance: 'outline',
          label: 'Contact',
          url: '/contact',
        },
      },
    ],
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Your Name',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h1',
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
                text: 'A concise statement about the work you do and the people you help.',
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
  layout: [...homeHireMeLayoutBlocks],
  meta: {
    title: 'Your Name — Portfolio',
    description: 'Portfolio, selected work, writing, and ways to collaborate.',
  },
}
