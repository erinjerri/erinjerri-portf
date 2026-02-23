import canUseDOM from './canUseDOM'

export const getServerSideURL = () => {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    (process.env.CF_PAGES_URL ? `https://${process.env.CF_PAGES_URL}` : undefined) ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')
  )
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  if (process.env.CF_PAGES_URL) {
    return `https://${process.env.CF_PAGES_URL}`
  }

  if (process.env.URL) {
    return process.env.URL
  }

  if (process.env.DEPLOY_PRIME_URL) {
    return process.env.DEPLOY_PRIME_URL
  }

  return process.env.NEXT_PUBLIC_SERVER_URL || ''
}
