import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Documents } from './collections/Documents'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { Watch } from './collections/Watch'
import { Brand } from './Brand/config'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const dbURL = process.env.DATABASE_URL || process.env.MONGODB_URI || ''
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0

const allowedOrigins = Array.from(
  new Set(
    [
      getServerSideURL(),
      process.env.URL,
      process.env.DEPLOY_PRIME_URL,
      ...(process.env.NODE_ENV === 'development'
        ? ['http://localhost:3000', 'http://127.0.0.1:3000']
        : []),
    ].filter(isNonEmptyString),
  ),
)

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
    url: dbURL,
  }),
  email: nodemailerAdapter({
    defaultFromAddress: process.env.PROTON_SMTP_USER ?? 'noreply@example.com',
    defaultFromName: process.env.SITE_NAME ?? 'Portfolio',
    // In CI / local scripts (e.g. `generate:types`) network access might be unavailable.
    // Skip transport verification unless explicitly enabled.
    skipVerify: process.env.EMAIL_VERIFY_TRANSPORT === 'true' ? false : true,
    transportOptions: {
      host: 'smtp.protonmail.ch',
      port: 587,
      secure: false,
      auth: {
        user: process.env.PROTON_SMTP_USER,
        pass: process.env.PROTON_SMTP_TOKEN,
      },
      tls: {
        rejectUnauthorized: true,
      },
    },
  }),
  collections: [Pages, Posts, Projects, Watch, Media, Documents, Categories, Users],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  globals: [Header, Footer, Brand],
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
    const hasDatabaseURL = Boolean(process.env.DATABASE_URL)
    const hasMongoDBURI = Boolean(process.env.MONGODB_URI)
    const selectedEnvVar = hasDatabaseURL ? 'DATABASE_URL' : hasMongoDBURI ? 'MONGODB_URI (legacy)' : 'none'
    const useR2Storage = process.env.USE_R2_STORAGE === 'true'
    const forcePayloadMediaProxy = process.env.NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY === 'true'
    const r2PublicHostname = process.env.R2_PUBLIC_HOSTNAME?.trim()
    const useR2DirectURLs =
      !forcePayloadMediaProxy &&
      (process.env.R2_PUBLIC_READS === 'true' || Boolean(r2PublicHostname))
    const r2Endpoint =
      process.env.R2_ENDPOINT ||
      (process.env.R2_ACCOUNT_ID
        ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
        : undefined)
    const r2ForcePathStyle = process.env.R2_FORCE_PATH_STYLE !== 'false'
    const hasR2Env =
      Boolean(process.env.R2_BUCKET) &&
      Boolean(r2Endpoint) &&
      Boolean(process.env.R2_ACCESS_KEY_ID) &&
      Boolean(process.env.R2_SECRET_ACCESS_KEY)

    payload.logger.info({
      msg: 'Startup media storage mode',
      r2Enabled: useR2Storage,
      r2EnvConfigured: hasR2Env,
      r2DirectURLs: useR2DirectURLs,
      r2EndpointConfigured: Boolean(r2Endpoint),
      r2ForcePathStyle,
      forcePayloadMediaProxy,
    })

    payload.logger.info({
      msg: 'Startup DB env presence',
      hasDatabaseURL,
      hasMongoDBURI,
      selectedEnvVar,
    })

    if (!hasDatabaseURL && hasMongoDBURI) {
      payload.logger.warn(
        'Startup DB config: using legacy MONGODB_URI. Please migrate to DATABASE_URL for consistency.',
      )
    }

    if (!dbURL) {
      payload.logger.warn('Startup DB target: DATABASE_URL/MONGODB_URI is not set.')
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
      payload.logger.warn('Startup DB target: failed to parse DATABASE_URL/MONGODB_URI.')
    }
  },
})
