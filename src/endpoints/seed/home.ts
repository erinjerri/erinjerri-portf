import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'

import { homeHireMeLayoutBlocks } from './home-hire-me-layout'

type HomeArgs = {
  heroImage1: Media
  heroImage2: Media
  heroImage3: Media
  metaImage: Media
}

type HomeSeed = RequiredDataFromCollectionSlug<'pages'>

const heroRichText: NonNullable<HomeSeed['hero']['richText']> = {
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
        direction: 'ltr' as const,
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
}

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage1,
  heroImage2,
  heroImage3,
  metaImage,
}) => ({
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
    heroImage1: heroImage1.id,
    heroImage2: heroImage2.id,
    heroImage3: heroImage3.id,
    richText: heroRichText,
  },
  layout: [...homeHireMeLayoutBlocks],
  meta: {
    title: 'Your Name — Portfolio',
    description: 'Portfolio, selected work, writing, and ways to collaborate.',
    image: metaImage.id,
  },
})
