import configPromise from '@payload-config'
import { getPayload } from 'payload'

declare global {
  var __payloadClientPromise: ReturnType<typeof getPayload> | undefined
}

export const getPayloadClient = async () => {
  if (!globalThis.__payloadClientPromise) {
    globalThis.__payloadClientPromise = getPayload({ config: configPromise })
  }

  return globalThis.__payloadClientPromise
}
