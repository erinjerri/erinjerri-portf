(function () {
  try {
    var currentScript = document.currentScript
    var measurementId = currentScript && currentScript.dataset ? currentScript.dataset.measurementId : ''
    if (!measurementId) return

    window.dataLayer = window.dataLayer || []
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments)
      }

    window.gtag('js', new Date())
    window.gtag('config', measurementId)
  } catch {
    /* no-op */
  }
})()
