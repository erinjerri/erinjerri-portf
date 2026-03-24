import path from 'path'
import { fileURLToPath } from 'url'

import dotenv from 'dotenv'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const projectDir = path.resolve(dirname, '../..')

dotenv.config({ path: path.join(projectDir, '.env.local'), override: false })
dotenv.config({ path: path.join(projectDir, '.env'), override: false })
