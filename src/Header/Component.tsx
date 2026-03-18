import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

interface HeaderProps {
  data?: Header | null
}

export async function Header({ data }: HeaderProps = {}) {
  let headerData: Header | null = data ?? null

  if (data === undefined) {
    try {
      headerData = (await getCachedGlobal('header', 1)()) as Header
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Header] Failed to fetch header:', err)
      }
    }
  }

  return <HeaderClient data={headerData} />
}
