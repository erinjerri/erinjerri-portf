/**
 * Performance: fixed width/height + explicit `sizes` avoids layout recalc when icons decode.
 */
'use client'

import Image from 'next/image'
import React, { useState } from 'react'

/**
 * Renders a social icon image with fallback to Lucide icon on 404/load error.
 * Avoids broken images and upstream fetch retries when R2 URLs fail.
 */
export function SocialIconImage({
  src,
  alt,
  fallback,
  className,
}: {
  src: string
  alt: string
  fallback: React.ReactNode
  className?: string
}) {
  const [error, setError] = useState(false)

  if (error) {
    return <>{fallback}</>
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={20}
      height={20}
      sizes="20px"
      onError={() => setError(true)}
      /**
       * Optimized on purpose. These source files are 640x640 PNGs rendered at
       * 20px; `unoptimized` shipped the originals (~7-12 KiB each, ~330ms each
       * through the media proxy) for a 20px slot. The onError fallback below
       * still covers any URL the optimizer can't handle.
       */
    />
  )
}
