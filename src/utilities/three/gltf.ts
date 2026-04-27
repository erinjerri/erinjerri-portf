import { LinearFilter, LoadingManager, Material, Object3D, Texture } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/'

type TextureLike = Texture & { isTexture?: boolean }
type MeshLike = Object3D & {
  isMesh?: boolean
  material?: Material | Material[]
  matrixAutoUpdate: boolean
}

export type CompressedGLTFLoaderOptions = {
  canvas?: HTMLCanvasElement
  dracoDecoderPath?: string
  onLoad?: () => void
  onProgress?: (progress: number) => void
  onError?: (error: unknown) => void
}

function forEachTexture(material: Material, callback: (texture: Texture) => void) {
  for (const value of Object.values(material as unknown as Record<string, unknown>)) {
    if (value && typeof value === 'object' && (value as TextureLike).isTexture) {
      callback(value as Texture)
    }
  }
}

export function optimizeStaticModel(root: Object3D) {
  root.traverse((object) => {
    const mesh = object as MeshLike
    if (!mesh.isMesh) return

    mesh.matrixAutoUpdate = false
    mesh.updateMatrix()

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      if (!material) continue

      forEachTexture(material, (texture) => {
        texture.minFilter = LinearFilter
        texture.needsUpdate = true
      })
    }
  })
}

export function createCompressedGLTFLoader(options: CompressedGLTFLoaderOptions = {}) {
  const { canvas, dracoDecoderPath = DRACO_DECODER_PATH, onError, onLoad, onProgress } = options

  if (canvas) {
    canvas.hidden = true
    canvas.style.visibility = 'hidden'
  }

  const manager = new LoadingManager()
  manager.onProgress = (_url, loaded, total) => {
    onProgress?.(total > 0 ? loaded / total : 0)
  }
  manager.onLoad = () => {
    if (canvas) {
      canvas.hidden = false
      canvas.style.visibility = 'visible'
    }
    onLoad?.()
  }
  manager.onError = (url) => {
    onError?.(new Error(`Failed to load GLTF asset: ${url}`))
  }

  const dracoLoader = new DRACOLoader(manager)
  dracoLoader.setDecoderPath(dracoDecoderPath)

  const loader = new GLTFLoader(manager)
  loader.setDRACOLoader(dracoLoader)

  return { dracoLoader, loader, manager }
}

export function loadCompressedGLTF(url: string, options: CompressedGLTFLoaderOptions = {}) {
  const { dracoLoader, loader } = createCompressedGLTFLoader(options)

  return new Promise<GLTF>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        optimizeStaticModel(gltf.scene)
        dracoLoader.dispose()
        resolve(gltf)
      },
      undefined,
      (error) => {
        dracoLoader.dispose()
        options.onError?.(error)
        reject(error)
      },
    )
  })
}
