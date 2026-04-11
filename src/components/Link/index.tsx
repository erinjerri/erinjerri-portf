import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page, Post } from '@/payload-types'

/** Payload `link` field appearances in DB / generated types; runtime maps unknown → default. */
type LegacyLinkAppearance = 'accent' | 'light' | 'inactive' | 'filter'

type CMSLinkType = {
  archive?: 'posts' | 'projects' | 'watch' | null
  appearance?: 'inline' | ButtonProps['variant'] | LegacyLinkAppearance | null
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  prefetch?: boolean
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'archive' | 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    archive,
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    prefetch,
    reference,
    size: sizeFromProps,
    url,
  } = props

  let href =
    type === 'archive' && archive
      ? `/${archive}`
      : type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  // Normalize plain email addresses to mailto: links
  if (
    href &&
    typeof href === 'string' &&
    href.includes('@') &&
    !href.includes('://') &&
    !href.startsWith('mailto:')
  ) {
    href = `mailto:${href}`
  }

  if (!href) return null

  /** CMS only ships default | outline; map legacy Payload values to supported Button variants. */
  const resolvedVariant: 'default' | 'outline' | 'link' | 'inline' =
    appearance === 'inline'
      ? 'inline'
      : appearance === 'outline' || appearance === 'link'
        ? appearance
        : 'default'

  const size = resolvedVariant === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (resolvedVariant === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} prefetch={prefetch} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  const buttonVariant: ButtonProps['variant'] = resolvedVariant

  return (
    <Button asChild className={className} size={size} variant={buttonVariant}>
      <Link className={cn(className)} href={href || url || ''} prefetch={prefetch} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
