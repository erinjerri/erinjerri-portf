import type { AffiliateProduct } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

/**
 * Book landing page: bold metrics + acclaim strip + Amazon CTA (same story as the speaker kit).
 * Slug: /creating-ar-vr-book — edit in CMS if your URL differs.
 */
type Args = {
  bookAffiliateProductId: AffiliateProduct['id']
}

export const creatingArVrBookPage = ({ bookAffiliateProductId }: Args): RequiredDataFromCollectionSlug<'pages'> => {
  return {
    slug: 'creating-ar-vr-book',
    _status: 'published',
    title: 'Creating AR & VR',
    hero: {
      type: 'none',
    },
    meta: {
      title: 'Creating Augmented and Virtual Realities — O’Reilly',
      description:
        'O’Reilly Media’s practical guide to AR/VR — debut #1 in Game Programming on Amazon, distributed in 42+ countries.',
    },
    layout: [
      {
        blockType: 'statStrip',
        blockName: 'Book metrics',
        eyebrow: 'By Erin Jerri Pañgilinan & co-authors',
        columns: 'four',
        emphasis: 'bold',
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
        heading: 'Book authority',
        items: [
          {
            variant: 'numbered',
            lead: "O'Reilly Media publication with international distribution.",
            body: 'Creating Augmented and Virtual Realities has reached readers across 42+ countries and positioned Erin in the AI, XR, and spatial computing ecosystem.',
          },
          {
            variant: 'numbered',
            lead: 'Translated editions in Chinese and Korean.',
            body: 'The work travels beyond a single market and continues to support global teams learning emerging interface systems.',
          },
          {
            variant: 'check',
            lead: '#1 Amazon Game Programming debut and BookAuthority recognition.',
            body: 'Authority signals come before purchase links so the section reads as expertise, not a storefront.',
          },
        ],
      },
      {
        blockType: 'affiliateProductsBlock',
        blockName: 'Buy the book',
        heading: 'Buy the book',
        showDisclosure: true,
        disclosureText: 'As an Amazon Associate I earn from qualifying purchases.',
        columns: '3',
        products: [bookAffiliateProductId],
      },
      {
        blockType: 'content',
        blockName: 'About the book',
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
                        text: 'Creating Augmented and Virtual Realities',
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
                        text: 'A practical, creator-friendly introduction to building for augmented and virtual reality. Replace this paragraph in the CMS with your full description, purchase links, and chapter overview.',
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
    ],
  }
}
