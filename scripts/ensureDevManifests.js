#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch {
    // ignore
  }
}

function writeIfMissing(filePath, content) {
  try {
    if (!fs.existsSync(filePath)) {
      const tempPath = `${filePath}.tmp`
      fs.writeFileSync(tempPath, content, { encoding: 'utf8' })
      fs.renameSync(tempPath, filePath)
      if (process.env.DEBUG_DEV_MANIFESTS === '1') {
        // eslint-disable-next-line no-console
        console.log(`Created dev manifest: ${filePath}`)
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Could not write ${filePath}:`, err && err.message ? err.message : err)
  }
}

function ensureDevManifests(cwd = process.cwd()) {
  const nextDir = path.resolve(cwd, '.next')
  const nextDevDir = path.join(nextDir, 'dev')

  ensureDir(nextDevDir)

  // Minimal manifests to avoid Next dev throwing ENOENT during cold starts.
  // Next may read these from `.next/dev/*` while booting.
  const preview = {
    previewModeId: 'development-preview-mode-id',
    previewModeEncryptionKey: 'development-preview-encryption-key',
    previewModeSigningKey: 'development-preview-signing-key',
  }

  writeIfMissing(
    path.join(nextDevDir, 'prerender-manifest.json'),
    JSON.stringify(
      {
        version: 4,
        routes: {},
        dynamicRoutes: {},
        notFoundRoutes: [],
        preview,
      },
      null,
      2,
    ),
  )
  const routesManifest = JSON.stringify(
    {
      version: 1,
      pages: {},
      dynamicRoutes: {},
      middleware: {
        beforeFiles: [],
        afterFiles: [],
        fallback: [],
      },
    },
    null,
    2,
  )

  writeIfMissing(path.join(nextDevDir, 'routes-manifest.json'), routesManifest)
  writeIfMissing(
    path.join(nextDevDir, 'app-paths-manifest.json'),
    JSON.stringify({}, null, 2),
  )

  // Some Next internals look for root manifests as well (depending on route type / stage).
  ensureDir(nextDir)
  writeIfMissing(
    path.join(nextDir, 'prerender-manifest.json'),
    JSON.stringify(
      {
        version: 4,
        routes: {},
        dynamicRoutes: {},
        notFoundRoutes: [],
        preview,
      },
      null,
      2,
    ),
  )
  writeIfMissing(path.join(nextDir, 'routes-manifest.json'), routesManifest)
}

module.exports = { ensureDevManifests }

if (require.main === module) {
  ensureDevManifests()
  process.exit(0)
}
