import { createLocalReq, getPayload } from 'payload'

import config from '../payload.config'
import { seed } from '../endpoints/seed'

async function runRestore(): Promise<void> {
  const payload = await getPayload({ config })

  const adminEmail = process.env.RESTORE_ADMIN_EMAIL || 'admin@local.dev'
  const adminPassword = process.env.RESTORE_ADMIN_PASSWORD || 'ChangeMe123!'
  const force = process.env.RESTORE_FORCE === 'true'

  const [users, pages, posts] = await Promise.all([
    payload.find({
      collection: 'users',
      limit: 1,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'posts',
      limit: 1,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const hasData = users.docs.length > 0 || pages.docs.length > 0 || posts.docs.length > 0

  if (hasData && !force) {
    payload.logger.warn(
      'Restore aborted: database is not empty. Set RESTORE_FORCE=true to reseed destructively.',
    )
    return
  }

  let user = users.docs[0]

  const createdAdmin = !user

  if (createdAdmin) {
    user = await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: adminPassword,
      },
      depth: 0,
      overrideAccess: true,
    })
    payload.logger.info(`Created admin user: ${adminEmail}`)
  } else {
    payload.logger.info(`Using existing user: ${user.email}`)
  }

  const req = await createLocalReq(
    {
      user: {
        ...(user as unknown as object),
        collection: 'users',
      } as never,
    },
    payload,
  )
  await seed({ payload, req })

  payload.logger.info('Restore complete.')
  if (createdAdmin) {
    payload.logger.info(`Login email: ${adminEmail}`)
    payload.logger.info(`Login password: ${adminPassword}`)
  } else {
    payload.logger.info(`Login email: ${user.email}`)
    payload.logger.info('Login password: existing password for that user')
  }
}

runRestore()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
