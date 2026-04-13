'use client'

import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'
import React from 'react'

// Avoid `@payloadcms/ui/scss` on the public site — it broke webpack client chunks (RSC).

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = () => {
  return null
}
