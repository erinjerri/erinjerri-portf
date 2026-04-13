import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'
import React from 'react'

/**
 * Public site: admin bar disabled. Kept as a server component so the root layout does not
 * register an extra `'use client'` chunk (those have triggered webpack `options.factory`
 * errors with react-server-dom-webpack on some Next 15 setups).
 */
export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = () => {
  return null
}
