#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function writeIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) return
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, { encoding: 'utf8' })
}

const serverDir = path.resolve(process.cwd(), '.next', 'server')
const middleware = {
  sortedMiddleware: [],
  middleware: [],
  functions: {},
}

writeIfMissing(path.join(serverDir, 'middleware-manifest.json'), JSON.stringify(middleware, null, 2))
writeIfMissing(path.join(serverDir, 'middleware-manifest.json'), JSON.stringify(middleware, null, 2))
