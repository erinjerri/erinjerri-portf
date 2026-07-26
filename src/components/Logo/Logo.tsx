import clsx from 'clsx'
import React from 'react'

import { SITE_OWNER_NAME } from '@/utilities/siteMetadata'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = ({ className }: Props) => (
  <span
    className={clsx(
      'font-title text-sm font-semibold uppercase tracking-[0.16em] text-current sm:text-base',
      className,
    )}
  >
    {SITE_OWNER_NAME}
  </span>
)
