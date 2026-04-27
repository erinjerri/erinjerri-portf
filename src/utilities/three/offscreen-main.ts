export type OffscreenThreeController = {
  destroy: () => void
  worker: Worker
}

export function startOffscreenThree(
  canvas: HTMLCanvasElement,
  workerUrl: URL | string = new URL('./offscreen-worker.ts', import.meta.url),
): OffscreenThreeController | null {
  if (!('transferControlToOffscreen' in canvas)) return null

  const worker = new Worker(workerUrl, { type: 'module' })
  const offscreen = canvas.transferControlToOffscreen()

  const sendResize = () => {
    const bounds = canvas.getBoundingClientRect()
    worker.postMessage({
      type: 'resize',
      height: Math.max(1, Math.round(bounds.height)),
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: Math.max(1, Math.round(bounds.width)),
    })
  }

  const sendPointerMove = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect()
    worker.postMessage({
      type: 'pointermove',
      x: (event.clientX - bounds.left) / Math.max(bounds.width, 1),
      y: (event.clientY - bounds.top) / Math.max(bounds.height, 1),
    })
  }

  worker.postMessage({ type: 'init', canvas: offscreen }, [offscreen])

  const resizeObserver = new ResizeObserver(sendResize)
  resizeObserver.observe(canvas)
  window.addEventListener('resize', sendResize, { passive: true })
  canvas.addEventListener('pointermove', sendPointerMove, { passive: true })
  sendResize()

  return {
    worker,
    destroy() {
      resizeObserver.disconnect()
      window.removeEventListener('resize', sendResize)
      canvas.removeEventListener('pointermove', sendPointerMove)
      worker.postMessage({ type: 'dispose' })
      worker.terminate()
    },
  }
}
