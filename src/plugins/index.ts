import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import type { Page, Post, Project } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page | Project> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Erin Jerri` : 'Erin Jerri'
}

const generateURL: GenerateURL<Post | Page | Project> = ({ doc }) => {
  const url = getServerSideURL()

  if (!doc?.slug) return url

  if ('relatedProjects' in doc) {
    return `${url}/projects/${doc.slug}`
  }

  if ('relatedWatch' in doc) {
    return `${url}/watch/${doc.slug}`
  }

  if ('relatedPosts' in doc) {
    return `${url}/posts/${doc.slug}`
  }

  return `${url}/${doc.slug}`
}

const r2Bucket = process.env.R2_BUCKET?.trim()
const r2AccountID = process.env.R2_ACCOUNT_ID?.trim()
const r2AccessKeyID = process.env.R2_ACCESS_KEY_ID?.trim()
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
const r2PublicHostname = process.env.R2_PUBLIC_HOSTNAME?.trim()
const r2Endpoint =
  process.env.R2_ENDPOINT?.trim() ||
  (r2AccountID ? `https://${r2AccountID}.r2.cloudflarestorage.com` : undefined)
const r2ForcePathStyle = process.env.R2_FORCE_PATH_STYLE !== 'false'
const useR2Storage = process.env.USE_R2_STORAGE === 'true'
const forcePayloadProxyReads = process.env.NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY === 'true'
const useR2DirectURLs =
  process.env.R2_PUBLIC_READS === 'true' || (useR2Storage && !forcePayloadProxyReads)
const hasR2S3Config = Boolean(
  useR2Storage && r2Bucket && r2Endpoint && r2AccessKeyID && r2SecretAccessKey,
)

export const plugins: Plugin[] = [
  ...(hasR2S3Config
    ? [
        s3Storage({
          collections: {
            media: useR2DirectURLs
              ? {
                  // Direct public object URLs from R2
                  disablePayloadAccessControl: true,
                  // When R2_PUBLIC_HOSTNAME is set, generate correct public URLs
                  // (R2 S3 API endpoint is not publicly accessible)
                  ...(r2PublicHostname && {
                    generateFileURL: ({ filename, prefix }) => {
                      const base = `https://${r2PublicHostname.replace(/^https?:\/\//, '')}`
                      const path = [prefix, filename].filter(Boolean).join('/')
                      return `${base}/${path}`
                    },
                  }),
                }
              : true,
          },
          bucket: r2Bucket as string,
          config: {
            credentials: {
              accessKeyId: r2AccessKeyID as string,
              secretAccessKey: r2SecretAccessKey as string,
            },
            endpoint: r2Endpoint as string,
            forcePathStyle: r2ForcePathStyle,
            region: 'auto',
            requestChecksumCalculation: 'WHEN_REQUIRED',
            responseChecksumValidation: 'WHEN_REQUIRED',
          },
        }),
      ]
    : []),
  redirectsPlugin({
    collections: ['pages', 'posts', 'projects', 'watch'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
