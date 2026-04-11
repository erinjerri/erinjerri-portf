import { getCachedGlobal } from '@/utilities/getGlobals'
import { headers } from 'next/headers'
import React from 'react'

import type { Header } from '@/payload-types'

import { HeaderClient } from './Component.client'

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

  const headerList = await headers()
  const initialPathname = headerList.get('x-pathname') ?? '/'

  return <HeaderClient data={headerData} initialPathname={initialPathname} />
}
