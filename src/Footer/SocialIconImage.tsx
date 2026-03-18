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
      onError={() => setError(true)}
      unoptimized
    />
  )
}
