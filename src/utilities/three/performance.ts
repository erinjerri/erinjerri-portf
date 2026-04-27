import { Material, Object3D, Texture, WebGLRenderer, type WebGLRendererParameters } from 'three'

type Disposable = { dispose: () => void }
type TextureLike = Texture & { isTexture?: boolean }

export function getCappedPixelRatio(maxPixelRatio = 2) {
  const pixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  return Math.min(pixelRatio, maxPixelRatio)
}

export function createOptimizedRenderer(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  parameters: Omit<WebGLRendererParameters, 'canvas'> = {},
) {
  const renderer = new WebGLRenderer({
    antialias: false,
    powerPreference: 'high-performance',
    ...parameters,
    canvas,
  })

  renderer.setPixelRatio(getCappedPixelRatio(2))

  return renderer
}

export function resizeRendererToDisplaySize(
  renderer: WebGLRenderer,
  width: number,
  height: number,
  pixelRatio = getCappedPixelRatio(2),
) {
  renderer.setPixelRatio(Math.min(pixelRatio, 2))
  renderer.setSize(Math.max(1, width), Math.max(1, height), false)
}

export function createDemandRenderLoop(renderFrame: (now: number) => void) {
  let frame = 0
  let active = false
  let needsUpdate = true

  const tick = (now: number) => {
    frame = 0
    if (!needsUpdate && !active) return

    needsUpdate = false
    renderFrame(now)

    if (active) {
      frame = requestAnimationFrame(tick)
    }
  }

  const invalidate = () => {
    needsUpdate = true
    if (!frame) frame = requestAnimationFrame(tick)
  }

  return {
    invalidate,
    startActive() {
      active = true
      invalidate()
    },
    stopActive() {
      active = false
    },
    dispose() {
      active = false
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    },
  }
}

function disposeMaterial(material: Material) {
  const maybeTextures = Object.values(material as unknown as Record<string, unknown>)

  for (const value of maybeTextures) {
    if (value && typeof value === 'object' && (value as TextureLike).isTexture) {
      const texture = value as Texture
      texture.dispose()
    }
  }

  material.dispose()
}

export function disposeScene(scene: Object3D) {
  scene.traverse((object) => {
    const maybeDisposableGeometry = (object as { geometry?: Disposable }).geometry
    if (maybeDisposableGeometry) {
      maybeDisposableGeometry.dispose()
    }

    const material = (object as { material?: Material | Material[] }).material
    if (Array.isArray(material)) {
      material.forEach(disposeMaterial)
    } else if (material) {
      disposeMaterial(material)
    }
  })
}
