import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { image3 } from './image-3'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
]

const categories = ['Technology', 'News', 'Finance', 'Design', 'Software', 'Engineering']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [],
      },
      depth: 0,
      req,
      context: {
        disableRevalidate: true,
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        subscribeSection: {
          slogan: '',
          showSubscribe: true,
        },
        linkGroups: [],
        socialLinks: [],
        copyright: '',
      },
      depth: 0,
      req,
      context: {
        disableRevalidate: true,
      },
    }),
    payload.updateGlobal({
      slug: 'brand' as GlobalSlug,
      data: {
        fonts: {
          title:
            "var(--font-league-spartan), var(--font-jost), 'Satoshi', 'Glacial Indifference', sans-serif",
          copy: "var(--font-jost), 'Satoshi', 'Glacial Indifference', var(--font-league-spartan), sans-serif",
        },
        colors: {
          light: {
            background: '222 35% 5%',
            foreground: '0 0% 74.9%',
            card: '210 28.8% 28.6%',
            cardForeground: '0 0% 74.9%',
            popover: '210 28.8% 28.6%',
            popoverForeground: '0 0% 74.9%',
            primary: '203.7 77.2% 48.2%',
            primaryForeground: '0 0% 96%',
            secondary: '185.4 100% 60.8%',
            secondaryForeground: '222 35% 5%',
            muted: '210 28.8% 28.6%',
            mutedForeground: '0 0% 62%',
            accent: '185.4 100% 60.8%',
            accentForeground: '222 35% 5%',
            destructive: '354 70% 55%',
            destructiveForeground: '0 0% 96%',
            border: '210 28.8% 34%',
            input: '210 28.8% 28.6%',
            ring: '203.7 77.2% 48.2%',
            success: '185.4 100% 60.8%',
            warning: '44 90% 62%',
            error: '354 70% 55%',
          },
          dark: {
            background: '222 35% 5%',
            foreground: '0 0% 74.9%',
            card: '210 28.8% 28.6%',
            cardForeground: '0 0% 74.9%',
            popover: '210 28.8% 28.6%',
            popoverForeground: '0 0% 74.9%',
            primary: '203.7 77.2% 48.2%',
            primaryForeground: '0 0% 96%',
            secondary: '185.4 100% 60.8%',
            secondaryForeground: '222 35% 5%',
            muted: '210 28.8% 28.6%',
            mutedForeground: '0 0% 62%',
            accent: '185.4 100% 60.8%',
            accentForeground: '222 35% 5%',
            destructive: '354 70% 55%',
            destructiveForeground: '0 0% 96%',
            border: '210 28.8% 34%',
            input: '210 28.8% 28.6%',
            ring: '203.7 77.2% 48.2%',
            success: '185.4 100% 60.8%',
            warning: '44 90% 62%',
            error: '354 70% 55%',
          },
        },
        radius: '0.5rem',
      } as any,
      depth: 0,
      req,
      context: {
        disableRevalidate: true,
      },
    }),
  ])

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: 'users',
    depth: 0,
    req,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })

  payload.logger.info(`— Seeding media...`)

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByPath(path.join(dirname, 'image-post1.webp')),
    fetchFileByPath(path.join(dirname, 'image-post2.webp')),
    fetchFileByPath(path.join(dirname, 'image-post3.webp')),
    fetchFileByPath(path.join(dirname, 'image-hero1.webp')),
  ])

  const [demoAuthor, image1Doc, image2Doc, image3Doc, imageHomeDoc] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'Demo Author',
        email: 'demo-author@example.com',
        password: 'password',
      },
      req,
    }),
    payload.create({
      collection: 'media',
      data: image1,
      file: image1Buffer,
      req,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image2Buffer,
      req,
    }),
    payload.create({
      collection: 'media',
      data: image3,
      file: image3Buffer,
      req,
    }),
    payload.create({
      collection: 'media',
      data: imageHero1,
      file: hero1Buffer,
      req,
    }),
    ...categories.map((category) =>
      payload.create({
        collection: 'categories',
        data: {
          title: category,
          slug: category,
        },
        req,
      }),
    ),
  ])

  payload.logger.info(`— Seeding posts...`)

  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    req,
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })

  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    req,
    context: {
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })

  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    req,
    context: {
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
  })

  // update each post with related posts
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id],
    },
    req,
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id],
    },
    req,
  })
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id],
    },
    req,
  })

  payload.logger.info(`— Seeding contact form...`)

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
    req,
  })

  payload.logger.info(`— Seeding pages...`)

  const [_, contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      data: home({ heroImage: imageHomeDoc, metaImage: image2Doc }),
      req,
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({ contactForm: contactForm }),
      req,
    }),
  ])

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Posts',
              url: '/posts',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
      req,
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        subscribeSection: {
          slogan: 'Making my cathedral one code block at a time.',
          showSubscribe: true,
        },
        linkGroups: [
          {
            header: 'About',
            links: [{ link: { type: 'custom', label: 'Home', url: '/' } }],
          },
          {
            header: 'Read',
            links: [{ link: { type: 'archive', label: 'Posts', archive: 'posts' } }],
          },
        ],
        socialLinks: [
          {
            label: 'GitHub',
            url: 'https://github.com',
          },
        ],
        copyright: '2026 Erin Jerri. All rights reserved.',
      },
      req,
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByPath(filePath: string): Promise<File> {
  const data = await fs.readFile(filePath)

  return {
    name: path.basename(filePath),
    data,
    mimetype: `image/${path.extname(filePath).replace('.', '') || 'webp'}`,
    size: data.byteLength,
  }
}
