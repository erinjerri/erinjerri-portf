'use client'

import React, { useEffect, useRef } from 'react'
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  Scene,
  TorusKnotGeometry,
  WebGLRenderer,
} from 'three'

import { disposeScene, resizeRendererToDisplaySize } from '@/utilities/three/performance'

const TARGET_FPS = 30
const MAX_PIXEL_RATIO = 1.5

export default function HeroAnimationFull() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let frame = 0
    let lastFrame = 0
    let lastTick = performance.now()
    let visible = document.visibilityState === 'visible'
    let inViewport = true

    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
      powerPreference: 'high-performance',
    })
    renderer.setClearColor(new Color(0x000000), 0)

    const scene = new Scene()
    const camera = new PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0.1, 0.08, 6.8)

    const geometry = new TorusKnotGeometry(0.42, 0.052, 48, 6)
    const material = new MeshPhysicalMaterial({
      color: 0xe0fff8,
      emissive: 0x07191d,
      metalness: 0.18,
      roughness: 0.16,
      transmission: 0.68,
      transparent: true,
      opacity: 0.3,
    })
    const object = new Mesh(geometry, material)
    object.position.set(2.24, -0.04, -2.05)
    object.rotation.x = -0.34
    object.rotation.z = 0.22
    scene.add(object)

    scene.add(new AmbientLight(0xe9f7ff, 1.45))

    const key = new DirectionalLight(0xffffff, 1.9)
    key.position.set(2.6, 2.6, 4.2)
    scene.add(key)

    const mint = new DirectionalLight(0x72ffd6, 1.05)
    mint.position.set(-2.4, 1.4, 2.4)
    scene.add(mint)

    const coral = new DirectionalLight(0xff8d71, 0.82)
    coral.position.set(1.6, -2.2, 2)
    scene.add(coral)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height)
      camera.updateProjectionMatrix()
      resizeRendererToDisplaySize(renderer, rect.width, rect.height, MAX_PIXEL_RATIO)
    }

    const render = (now: number) => {
      frame = requestAnimationFrame(render)
      if (!visible || !inViewport) return
      if (now - lastFrame < 1000 / TARGET_FPS) return

      const delta = Math.min(0.05, (now - lastTick) / 1000)
      lastTick = now
      lastFrame = now

      object.rotation.y += delta * 0.065
      object.rotation.x = -0.34 + Math.sin(now * 0.00014) * 0.02
      object.position.y = -0.04 + Math.sin(now * 0.00012) * 0.024
      object.position.x = 2.24 + Math.sin(now * 0.0001) * 0.018
      renderer.render(scene, camera)
    }

    const onVisibility = () => {
      visible = document.visibilityState === 'visible'
      lastTick = performance.now()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewport = Boolean(entry?.isIntersecting)
        lastTick = performance.now()
      },
      { threshold: 0.01 },
    )

    const resizeObserver = new ResizeObserver(resize)
    observer.observe(canvas)
    resizeObserver.observe(canvas)
    document.addEventListener('visibilitychange', onVisibility)

    resize()
    renderer.render(scene, camera)
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      disposeScene(scene)
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-62" />
}
