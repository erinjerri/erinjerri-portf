import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { Watch } from './collections/Watch'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block and seed action.
      beforeDashboard: ['@/components/BeforeDashboard'],
      graphics: {
        Icon: '@/components/AdminGraphics/Icon',
        Logo: '@/components/AdminGraphics/Logo',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  collections: [Pages, Posts, Projects, Watch, Media, Categories, Users],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
  onInit: async (payload) => {
    const dbURL = process.env.DATABASE_URL
    const useR2Storage = process.env.USE_R2_STORAGE === 'true'
    const useR2DirectURLs = process.env.R2_PUBLIC_READS === 'true'
    const forcePayloadMediaProxy = process.env.NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY === 'true'
    const hasR2Env =
      Boolean(process.env.R2_BUCKET) &&
      Boolean(process.env.R2_ACCOUNT_ID) &&
      Boolean(process.env.R2_ACCESS_KEY_ID) &&
      Boolean(process.env.R2_SECRET_ACCESS_KEY)

    payload.logger.info({
      msg: 'Startup media storage mode',
      r2Enabled: useR2Storage,
      r2EnvConfigured: hasR2Env,
      r2DirectURLs: useR2DirectURLs,
      forcePayloadMediaProxy,
    })

    if (!dbURL) {
      payload.logger.warn('Startup DB target: DATABASE_URL is not set.')
      return
    }

    try {
      const parsedURL = new URL(dbURL)
      const dbName = parsedURL.pathname.replace(/^\/+/, '') || '(default)'

      payload.logger.info({
        msg: 'Startup DB target',
        protocol: parsedURL.protocol.replace(':', ''),
        host: parsedURL.hostname,
        db: dbName,
      })
    } catch {
      payload.logger.warn('Startup DB target: failed to parse DATABASE_URL.')
    }
  },
})
