(function () {
  try {
    var currentScript = document.currentScript
    var containerId = currentScript && currentScript.dataset ? currentScript.dataset.gtmContainerId : ''
    if (!containerId) return

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

    var firstScript = document.getElementsByTagName('script')[0]
    if (!firstScript || !firstScript.parentNode) return

    var script = document.createElement('script')
    script.async = true
    script.src =
      'https://www.googletagmanager.com/gtm.js?id=' +
      encodeURIComponent(containerId) +
      '&l=dataLayer'
    firstScript.parentNode.insertBefore(script, firstScript)
  } catch {
    /* no-op */
  }
})()
