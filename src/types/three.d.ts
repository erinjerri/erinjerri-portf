declare module 'three' {
  export type WebGLRendererParameters = {
    alpha?: boolean
    antialias?: boolean
    canvas?: HTMLCanvasElement | OffscreenCanvas
    powerPreference?: WebGLPowerPreference
    premultipliedAlpha?: boolean
    preserveDrawingBuffer?: boolean
    stencil?: boolean
  }

  export class Texture {
    isTexture?: boolean
    minFilter: unknown
    needsUpdate: boolean
    dispose(): void
  }

  export class Material {
    id: number
    dispose(): void
  }

  export class BufferGeometry {
    clone(): BufferGeometry
    applyMatrix4(matrix: unknown): BufferGeometry
    dispose(): void
  }

  export class Object3D {
    name: string
    parent?: Object3D
    matrixAutoUpdate: boolean
    matrixWorld: unknown
    rotation: { x: number; y: number; z: number }
    add(object: Object3D): void
    remove(object: Object3D): void
    traverse(callback: (object: Object3D) => void): void
    updateMatrix(): void
    updateWorldMatrix(updateParents: boolean, updateChildren: boolean): void
  }

  export class Mesh extends Object3D {
    isMesh: true
    geometry: BufferGeometry
    material: Material | Material[]
    constructor(geometry?: BufferGeometry, material?: Material | Material[])
  }

  export class Scene extends Object3D {
    background: Color | null
  }

  export class PerspectiveCamera extends Object3D {
    aspect: number
    position: { x: number; y: number; z: number }
    constructor(fov: number, aspect: number, near: number, far: number)
    updateProjectionMatrix(): void
  }

  export class WebGLRenderer {
    constructor(parameters?: WebGLRendererParameters)
    dispose(): void
    render(scene: Scene, camera: PerspectiveCamera): void
    setPixelRatio(pixelRatio: number): void
    setSize(width: number, height: number, updateStyle?: boolean): void
  }

  export class LoadingManager {
    onError?: (url: string) => void
    onLoad?: () => void
    onProgress?: (url: string, loaded: number, total: number) => void
  }

  export class Color {
    constructor(color: number | string)
  }

  export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number)
  }

  export class MeshBasicMaterial extends Material {
    constructor(parameters?: Record<string, unknown>)
  }

  export const LinearFilter: unknown
}

declare module 'three/examples/jsm/loaders/DRACOLoader.js' {
  import type { LoadingManager } from 'three'

  export class DRACOLoader {
    constructor(manager?: LoadingManager)
    dispose(): void
    setDecoderPath(path: string): this
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import type { LoadingManager, Object3D } from 'three'
  import type { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

  export type GLTF = {
    scene: Object3D
    scenes: Object3D[]
  }

  export class GLTFLoader {
    constructor(manager?: LoadingManager)
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (error: unknown) => void,
    ): void
    setDRACOLoader(loader: DRACOLoader): this
  }
}

declare module 'three/examples/jsm/utils/BufferGeometryUtils.js' {
  import type { BufferGeometry } from 'three'

  export function mergeGeometries(
    geometries: BufferGeometry[],
    useGroups?: boolean,
  ): BufferGeometry | null
}
