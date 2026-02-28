import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

export async function Header() {
  let headerData: Header | null = null
  try {
    headerData = (await getCachedGlobal('header', 1)()) as Header
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Header] Failed to fetch header:', err)
    }
  }

  return <HeaderClient data={headerData} />
}
