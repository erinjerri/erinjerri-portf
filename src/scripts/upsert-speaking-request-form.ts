import './loadEnv'

import { getPayload } from 'payload'

import config from '../payload.config'
import { speakingRequestFormData } from '../endpoints/seed/speaking-request-form'

async function run(): Promise<void> {
  const payload = await getPayload({ config })

  const { createdAt: _createdAt, updatedAt: _updatedAt, ...formData } = speakingRequestFormData

  const existing = await payload.find({
    collection: 'forms',
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
    where: {
      title: {
        equals: formData.title,
      },
    },
  })

  const existingForm = existing.docs[0]

  let speakingFormID: string

  if (existingForm) {
    await payload.update({
      collection: 'forms',
      id: existingForm.id,
      depth: 0,
      overrideAccess: true,
      data: formData,
    })
    speakingFormID = String(existingForm.id)
    payload.logger.info(`Updated existing form "${formData.title}" (${speakingFormID}).`)
  } else {
    const created = await payload.create({
      collection: 'forms',
      depth: 0,
      overrideAccess: true,
      data: formData,
    })
    speakingFormID = String(created.id)
    payload.logger.info(`Created form "${formData.title}" (${speakingFormID}).`)
  }

  const aboutPages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    pagination: false,
    overrideAccess: true,
    where: {
      slug: {
        equals: 'about',
      },
    },
  })

  const aboutPage = aboutPages.docs[0] as
    | {
        id: string
        layout?: Array<Record<string, unknown>>
      }
    | undefined

  if (!aboutPage || !Array.isArray(aboutPage.layout)) {
    payload.logger.warn('About page not found or has no layout. Skipped form block linkage.')
    return
  }

  let updated = false
  const layout = aboutPage.layout.map((block) => {
    if (block?.blockType !== 'formBlock') return block

    const next = {
      ...block,
      form: speakingFormID,
    }
    updated = true
    return next
  })

  if (!updated) {
    payload.logger.warn('No formBlock found on About page. Skipped form linkage.')
    return
  }

  await payload.update({
    collection: 'pages',
    id: aboutPage.id,
    depth: 0,
    overrideAccess: true,
    data: {
      layout,
    },
  })

  payload.logger.info(`Linked About page form block to "${formData.title}" (${speakingFormID}).`)
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
