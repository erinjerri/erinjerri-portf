declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
      NEXT_PUBLIC_CLARITY_PROJECT_ID?: string
      GOOGLE_ANALYTICS_PROPERTY_ID?: string
      GOOGLE_ANALYTICS_CLIENT_EMAIL?: string
      GOOGLE_ANALYTICS_PRIVATE_KEY?: string
      LINKEDIN_CLIENT_ID?: string
      LINKEDIN_CLIENT_SECRET?: string
      LINKEDIN_REFRESH_TOKEN?: string
      LINKEDIN_ORGANIZATION_ID?: string
      META_APP_ID?: string
      META_APP_SECRET?: string
      META_ACCESS_TOKEN?: string
      FACEBOOK_PAGE_ID?: string
      INSTAGRAM_BUSINESS_ACCOUNT_ID?: string
      X_CLIENT_ID?: string
      X_CLIENT_SECRET?: string
      X_BEARER_TOKEN?: string
      X_USER_ID?: string
      YOUTUBE_CLIENT_ID?: string
      YOUTUBE_CLIENT_SECRET?: string
      YOUTUBE_REFRESH_TOKEN?: string
      YOUTUBE_CHANNEL_ID?: string
      ANALYTICS_SYNC_ENABLED?: 'true' | 'false'
      ANALYTICS_SYNC_CRON?: string
      ANALYTICS_SYNC_QUEUE?: string
      CF_PAGES_URL?: string
      USE_R2_STORAGE?: 'true' | 'false'
      R2_PUBLIC_READS?: 'true' | 'false'
      R2_PUBLIC_HOSTNAME?: string
      R2_ACCOUNT_ID?: string
      R2_BUCKET?: string
      R2_ACCESS_KEY_ID?: string
      R2_SECRET_ACCESS_KEY?: string
      R2_ENDPOINT?: string
      R2_FORCE_PATH_STYLE?: 'true' | 'false'
      /** S3/R2 key prefix for media (default: media). Set if Payload uses a different prefix. */
      R2_MEDIA_PREFIX?: string
      /** Comma-separated page slugs that receive the default AR/VR book stat strip (see enhancePageForRoute). */
      BOOK_PAGE_SLUG?: string
      ALLOW_SEED_IN_PROD?: 'true' | 'false'
      VERCEL_PROJECT_PRODUCTION_URL: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
