import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Documents } from './collections/Documents'
import { AffiliateProducts } from './collections/AffiliateProducts'
import { AnalyticsSnapshots } from './collections/AnalyticsSnapshots'
import { LinkedInMetrics } from './collections/LinkedInMetrics'
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
import { mediumSyncTask } from './jobs/mediumSync'
import { analyticsSyncTask } from './jobs/analyticsSync'
import { paragraphSyncTask } from './jobs/paragraphSync'
import { substackSyncTask } from './jobs/substackSync'
import {
  analyticsGoalOptions,
  analyticsWidgetPlatformFilterOptions,
  analyticsWidgetTimeframeOptions,
} from './utilities/analytics/constants'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const dbURL = process.env.DATABASE_URL || process.env.MONGODB_URI || ''
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0
// schedulePublishTask is auto-injected by Payload when collections/globals have schedulePublish: true

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
    dashboard: {
      widgets: [
        {
          slug: 'conversion-overview',
          label: 'Conversion Overview',
          ComponentPath: '@/components/dashboard/widgets/ConversionOverviewWidget',
          minWidth: 'medium',
          maxWidth: 'full',
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'timeframe',
              type: 'select',
              defaultValue: '30d',
              options: [...analyticsWidgetTimeframeOptions],
            },
            {
              name: 'platform',
              type: 'select',
              defaultValue: 'all',
              options: [...analyticsWidgetPlatformFilterOptions],
            },
            {
              name: 'goal',
              type: 'select',
              defaultValue: 'newsletter_signup',
              options: [...analyticsGoalOptions],
            },
          ],
        },
        {
          slug: 'source-performance',
          label: 'Channel Performance',
          ComponentPath: '@/components/dashboard/widgets/SourcePerformanceWidget',
          minWidth: 'large',
          maxWidth: 'full',
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'timeframe',
              type: 'select',
              defaultValue: '30d',
              options: [...analyticsWidgetTimeframeOptions],
            },
            {
              name: 'goal',
              type: 'select',
              defaultValue: 'newsletter_signup',
              options: [...analyticsGoalOptions],
            },
          ],
        },
        {
          slug: 'sync-health',
          label: 'Analytics Connection Health',
          ComponentPath: '@/components/dashboard/widgets/SyncHealthWidget',
          minWidth: 'medium',
          maxWidth: 'large',
          fields: [
            {
              name: 'title',
              type: 'text',
            },
          ],
        },
      ],
      defaultLayout: () => [
        {
          widgetSlug: 'conversion-overview',
          width: 'large',
          data: {
            title: '30-Day Conversion Overview',
            timeframe: '30d',
            platform: 'all',
            goal: 'newsletter_signup',
          },
        },
        {
          widgetSlug: 'sync-health',
          width: 'medium',
          data: {
            title: 'Provider Setup Status',
          },
        },
        {
          widgetSlug: 'source-performance',
          width: 'full',
          data: {
            title: 'Source Performance',
            timeframe: '30d',
            goal: 'newsletter_signup',
          },
        },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block and seed action.
      beforeDashboard: ['@/components/BeforeDashboard', '@/components/LoadLexicalList'],
      afterNavLinks: ['@/components/dashboard/AnalyticsNavLink#default'],
      graphics: {
        Icon: '@/components/AdminGraphics/Icon',
        Logo: '@/components/AdminGraphics/Logo',
      },
      views: {
        analyticsDashboard: {
          Component: '@/components/dashboard/AnalyticsView#default',
          path: '/analytics-dashboard',
          meta: { title: 'Analytics Dashboard' },
        },
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
    connectOptions: {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    },
    // Disable transactions to avoid MongoExpiredSessionError when using MongoDB
    // without a replica set (e.g. Atlas free tier, local dev)
    transactionOptions: false,
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
  collections: [
    Pages,
    Posts,
    Projects,
    Watch,
    AnalyticsSnapshots,
    LinkedInMetrics,
    Media,
    Documents,
    Categories,
    AffiliateProducts,
    Users,
  ],
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
    tasks: [analyticsSyncTask, substackSyncTask, mediumSyncTask, paragraphSyncTask],
  },
  onInit: async (payload) => {
    const hasDatabaseURL = Boolean(process.env.DATABASE_URL)
    const hasMongoDBURI = Boolean(process.env.MONGODB_URI)
    const selectedEnvVar = hasDatabaseURL
      ? 'DATABASE_URL'
      : hasMongoDBURI
        ? 'MONGODB_URI (legacy)'
        : 'none'
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
