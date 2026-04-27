import { Color, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry } from 'three'

import {
  createDemandRenderLoop,
  createOptimizedRenderer,
  disposeScene,
  resizeRendererToDisplaySize,
} from './performance'

type WorkerMessage =
  | { type: 'init'; canvas: OffscreenCanvas }
  | { type: 'resize'; width: number; height: number; pixelRatio: number }
  | { type: 'pointermove'; x: number; y: number }
  | { type: 'dispose' }

let renderer: ReturnType<typeof createOptimizedRenderer> | null = null
let scene: Scene | null = null
let camera: PerspectiveCamera | null = null
let loop: ReturnType<typeof createDemandRenderLoop> | null = null
let mesh: Mesh | null = null
let width = 1
let height = 1

function render() {
  if (!renderer || !scene || !camera || !mesh) return
  mesh.rotation.y += 0.01
  renderer.render(scene, camera)
}

function init(canvas: OffscreenCanvas) {
  renderer = createOptimizedRenderer(canvas)
  scene = new Scene()
  scene.background = new Color(0x05070d)

  camera = new PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.z = 4

  mesh = new Mesh(
    new SphereGeometry(1, 32, 16),
    new MeshBasicMaterial({ color: 0x8de8ff, wireframe: true }),
  )
  scene.add(mesh)

  loop = createDemandRenderLoop(render)
  loop.startActive()
}

function resize(nextWidth: number, nextHeight: number, pixelRatio: number) {
  width = Math.max(1, nextWidth)
  height = Math.max(1, nextHeight)

  if (camera) {
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  if (renderer) {
    resizeRendererToDisplaySize(renderer, width, height, pixelRatio)
  }

  loop?.invalidate()
}

function dispose() {
  loop?.dispose()
  if (scene) disposeScene(scene)
  renderer?.dispose()
  loop = null
  mesh = null
  scene = null
  camera = null
  renderer = null
}

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const message = event.data

  if (message.type === 'init') {
    init(message.canvas)
    return
  }

  if (message.type === 'resize') {
    resize(message.width, message.height, message.pixelRatio)
    return
  }

  if (message.type === 'pointermove' && mesh) {
    mesh.rotation.x = (message.y - 0.5) * 0.7
    mesh.rotation.y = (message.x - 0.5) * 0.7
    loop?.invalidate()
    return
  }

  if (message.type === 'dispose') {
    dispose()
  }
})
