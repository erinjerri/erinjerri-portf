import type { CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'

const SPEAKING_REQUEST_TITLE = 'speaking request'

const topicFieldNames = [
  'topic-ai-agentic-systems',
  'topic-spatial-computing',
  'topic-future-of-work',
  'topic-multimodal-interfaces',
  'topic-ai-creativity',
  'topic-woc-tech-leadership',
  'topic-founder-journey',
  'topic-custom-selected',
] as const

function hasMeaningfulValue(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized.length > 0 && normalized !== 'false' && normalized !== '0'
  }
  if (typeof value === 'number') return value !== 0
  return Boolean(value)
}

export const validateSpeakingRequestTopics: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data || typeof data !== 'object') return data

  const formRef = (data as { form?: unknown }).form
  let formTitle = ''

  if (formRef && typeof formRef === 'object' && 'title' in formRef) {
    formTitle = String((formRef as { title?: unknown }).title ?? '')
  } else if (typeof formRef === 'string' || typeof formRef === 'number') {
    const formDoc = await req.payload.findByID({
      collection: 'forms',
      id: String(formRef),
      depth: 0,
      overrideAccess: true,
      req,
    })
    formTitle = formDoc?.title ?? ''
  }

  if (formTitle.trim().toLowerCase() !== SPEAKING_REQUEST_TITLE) return data

  const submissionData = (data as { submissionData?: Array<{ field?: unknown; value?: unknown }> })
    .submissionData

  if (!Array.isArray(submissionData)) {
    throw new APIError('Please select at least one topic you are interested in.', 400)
  }

  const byField = new Map<string, unknown>()
  for (const row of submissionData) {
    if (!row || typeof row !== 'object') continue
    const field = typeof row.field === 'string' ? row.field : undefined
    if (!field) continue
    byField.set(field, row.value)
  }

  const hasTopicSelection = topicFieldNames.some((fieldName) => hasMeaningfulValue(byField.get(fieldName)))

  if (!hasTopicSelection) {
    throw new APIError('Please select at least one topic you are interested in.', 400)
  }

  return data
}
