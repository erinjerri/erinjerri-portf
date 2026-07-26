/** Path segment for Payload media URL (leading slash). Override via NEXT_PUBLIC_DEFAULT_OG_IMAGE_PATH. */
export const DEFAULT_OG_IMAGE_PATH =
  process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE_PATH?.trim() || '/og-default.svg'

export const DEFAULT_OG_IMAGE_WIDTH = 1200
export const DEFAULT_OG_IMAGE_HEIGHT = 630
