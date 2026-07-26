import Script from 'next/script'

export function GoogleTagManagerHead({ containerId }: { containerId: string }) {
  return (
    <Script
      src="/scripts/gtm-init.js"
      strategy="afterInteractive"
      data-gtm-container-id={containerId}
    />
  )
}

export function GoogleTagManagerNoScript({ containerId }: { containerId: string }) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(containerId)}`}
        height={0}
        width={0}
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  )
}
