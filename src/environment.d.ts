declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
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
      ALLOW_SEED_IN_PROD?: 'true' | 'false'
      VERCEL_PROJECT_PRODUCTION_URL: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
