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
const MAX_PIXEL_RATIO = 2

export default function HeroAnimationLite() {
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
      powerPreference: 'low-power',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
    renderer.setClearColor(new Color(0x000000), 0)

    const scene = new Scene()
    const camera = new PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 0.06, 6.4)

    const geometry = new TorusKnotGeometry(0.34, 0.042, 128, 8)
    const material = new MeshPhysicalMaterial({
      color: 0xd8fff7,
      emissive: 0x07191d,
      metalness: 0.12,
      roughness: 0.18,
      transmission: 0.62,
      transparent: true,
      opacity: 0.28,
    })
    const object = new Mesh(geometry, material)
    object.position.set(1.52, -0.08, -1.7)
    object.rotation.x = -0.28
    object.rotation.z = 0.18
    scene.add(object)

    scene.add(new AmbientLight(0xdfefff, 1.35))

    const key = new DirectionalLight(0xffffff, 1.7)
    key.position.set(2.4, 2.2, 3.8)
    scene.add(key)

    const rim = new DirectionalLight(0xff987b, 0.95)
    rim.position.set(-3, -1, 2)
    scene.add(rim)

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

      object.rotation.y += delta * 0.075
      object.rotation.x = -0.28 + Math.sin(now * 0.00018) * 0.018
      object.position.y = -0.08 + Math.sin(now * 0.00016) * 0.02
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block h-full w-full opacity-60 [image-rendering:auto]"
    />
  )
}
