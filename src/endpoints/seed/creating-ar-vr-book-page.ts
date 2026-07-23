import type { AffiliateProduct } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

/**
 * Book landing page: bold metrics + acclaim strip + Amazon CTA (same story as the speaker kit).
 * Slug: /creating-ar-vr-book — edit in CMS if your URL differs.
 */
type Args = {
  bookAffiliateProductId: AffiliateProduct['id']
}

export const creatingArVrBookPage = ({
  bookAffiliateProductId,
}: Args): RequiredDataFromCollectionSlug<'pages'> => {
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
        blockType: 'affiliateProductsBlock',
        blockName: 'Buy the book',
        heading: 'Read the book',
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
                        text: 'Published by O’Reilly Media, Creating Augmented and Virtual Realities brings together practitioners across AR, VR, AI, games, and spatial computing. The book debuted #1 in Amazon’s Game Programming category, has been translated into Chinese and Korean, and continues to reach developers, researchers, and product teams around the world.',
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
