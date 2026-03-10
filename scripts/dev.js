#!/usr/bin/env node
const { spawn } = require('child_process')
const { ensureDevManifests } = require('./ensureDevManifests')

const args = process.argv.slice(2)
const isFast = args.includes('--fast')

// Next can remove `.next/dev/*` during cold starts; keep critical manifests present.
ensureDevManifests()
const interval = setInterval(() => {
  ensureDevManifests()
}, 750)

function stopInterval() {
  try {
    clearInterval(interval)
  } catch {
    // ignore
  }
}

// Run Next's CLI via Node for pnpm compatibility.
const nextBin = require.resolve('next/dist/bin/next')

const childEnv = {
  ...process.env,
  NODE_OPTIONS: process.env.NODE_OPTIONS
    ? `${process.env.NODE_OPTIONS} --no-deprecation`
    : '--no-deprecation',
}

if (isFast) {
  childEnv.NEXT_PUBLIC_USE_PAYLOAD_MEDIA_PROXY = 'false'
}

const child = spawn(process.execPath, [nextBin, 'dev', '--webpack'], {
  stdio: 'inherit',
  env: childEnv,
})

child.on('exit', (code, signal) => {
  stopInterval()
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})

child.on('error', (err) => {
  stopInterval()
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
