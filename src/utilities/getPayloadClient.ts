import configPromise from '@payload-config'
import { getPayload } from 'payload'

declare global {
  var __payloadClientPromise: ReturnType<typeof getPayload> | undefined
}

export const resetPayloadClient = () => {
  globalThis.__payloadClientPromise = undefined
}

export const getPayloadClient = async (options?: { forceRefresh?: boolean }) => {
  if (options?.forceRefresh) {
    resetPayloadClient()
  }

  if (!globalThis.__payloadClientPromise) {
    globalThis.__payloadClientPromise = getPayload({ config: configPromise })
  }

  try {
    return await globalThis.__payloadClientPromise
  } catch (error) {
    resetPayloadClient()
    throw error
  }
}

/** Errors where resetting the Payload singleton and retrying usually fixes the issue */
const MONGO_CONNECTION_RETRYABLE_NAMES = new Set([
  'MongoNotConnectedError',
  'MongoExpiredSessionError',
])

function mongoDisconnectMessage(error: Error): boolean {
  const m = error.message
  if (typeof m !== 'string') return false
  return (
    m.includes('Client must be connected') ||
    m.includes('must be connected before running operations')
  )
}

export const isMongoConnectionRetryableError = (error: unknown): error is Error =>
  error instanceof Error &&
  (MONGO_CONNECTION_RETRYABLE_NAMES.has(error.name) || mongoDisconnectMessage(error))

export const isMongoNotConnectedError = isMongoConnectionRetryableError

export const withPayloadClientRetry = async <T>(
  operation: (payload: Awaited<ReturnType<typeof getPayloadClient>>) => Promise<T>,
  options?: {
    attempts?: number
    baseDelayMs?: number
  },
): Promise<T> => {
  const attempts =
    options?.attempts ?? (process.env.NODE_ENV === 'development' ? 6 : 3)
  const baseDelayMs = options?.baseDelayMs ?? 1500

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const payload = await getPayloadClient({
        forceRefresh: attempt > 0,
      })
      return await operation(payload)
    } catch (error) {
      if (!isMongoConnectionRetryableError(error) || attempt >= attempts - 1) {
        throw error
      }

      resetPayloadClient()
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * (attempt + 1)))
    }
  }

  throw new Error('Payload client retry exhausted unexpectedly.')
}
