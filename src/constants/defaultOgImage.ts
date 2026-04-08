/** Path segment for Payload media URL (leading slash). Override via NEXT_PUBLIC_DEFAULT_OG_IMAGE_PATH. */
export const DEFAULT_OG_IMAGE_PATH =
  process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE_PATH?.trim() ||
  '/api/media/file/erinjerri-book-headshot-green-no-glare-2400x2654.webp'

/** Display intrinsic size for next/image (2000×2200). Source asset is 2400×2654. */
export const DEFAULT_OG_IMAGE_WIDTH = 2000
export const DEFAULT_OG_IMAGE_HEIGHT = 2200
