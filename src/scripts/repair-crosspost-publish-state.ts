import './loadEnv'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { repairCrosspostPublishState } from '../utilities/crossposts/repairCrosspostPublishState'

void (async () => {
  const payload = await getPayload({ config: configPromise })
  const result = await repairCrosspostPublishState({ payload })

  if (result.totalRepaired === 0) {
    console.log('[repair-crossposts] No approved imported posts needed repair.')
  }

  for (const post of result.repaired) {
    console.log(
      `[repair-crossposts] Published "${post.title}" (${post.slug}) from workflow=${post.workflowStatus}.`,
    )
  }

  console.log('[repair-crossposts] Done.')
  process.exit(0)
})().catch((error) => {
  console.error('[repair-crossposts] Failed:', error)
  process.exit(1)
})
