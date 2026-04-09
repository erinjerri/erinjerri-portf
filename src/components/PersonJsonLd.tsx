'use client'

import { useEffect } from 'react'

import { PERSON_JSON_LD } from '@/utilities/siteMetadata'

const SCRIPT_ID = 'person-jsonld-schema'

/**
 * Injects Person JSON-LD after mount so it is not a React-hydrated <script> in <head>.
 * Some browser extensions replace the first head script before hydration, which causes
 * false hydration mismatch errors against server-rendered JSON-LD.
 */
export function PersonJsonLd() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return

    const el = document.createElement('script')
    el.id = SCRIPT_ID
    el.type = 'application/ld+json'
    el.textContent = JSON.stringify(PERSON_JSON_LD)
    document.body.appendChild(el)

    return () => {
      document.getElementById(SCRIPT_ID)?.remove()
    }
  }, [])

  return null
}
