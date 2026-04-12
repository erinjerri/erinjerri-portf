'use client'

import React, { useEffect, useRef } from 'react'

type CurveLayer = {
  baseY: number
  amplitude: number
  speed: number
  color: string
  opacity: number
  tensionA: number
  tensionB: number
  phase: number
  slope: number
}

type CurvePoint = { x: number; y: number }

const LAYERS: CurveLayer[] = [
  {
    baseY: -0.18,
    amplitude: 0.055,
    speed: 0.26,
    color: '#b8efff',
    opacity: 1,
    tensionA: 1.45,
    tensionB: 2.8,
    phase: 0.4,
    slope: 0.58,
  },
  {
    baseY: -0.24,
    amplitude: 0.07,
    speed: 0.22,
    color: '#b6a9ff',
    opacity: 0.6,
    tensionA: 1.2,
    tensionB: 2.4,
    phase: 1.55,
    slope: 0.62,
  },
  {
    baseY: -0.08,
    amplitude: 0.09,
    speed: 0.18,
    color: '#8bdcff',
    opacity: 0.38,
    tensionA: 1.1,
    tensionB: 2.2,
    phase: 2.1,
    slope: 0.36,
  },
  {
    baseY: -0.38,
    amplitude: 0.06,
    speed: 0.14,
    color: '#79bcff',
    opacity: 0.28,
    tensionA: 0.9,
    tensionB: 2.4,
    phase: 0.9,
    slope: 0.22,
  },
]

const CURVE_POINT_COUNT = 90
const STAR_COUNT = 14

function buildCurvePoints(config: CurveLayer, time: number): CurvePoint[] {
  const points: CurvePoint[] = []

  for (let index = 0; index < CURVE_POINT_COUNT; index += 1) {
    const t = index / (CURVE_POINT_COUNT - 1)
    const x = -1.25 + t * 2.5
    const diagonal = (t - 0.5) * config.slope
    const waveA = Math.sin(t * Math.PI * config.tensionA + time * config.speed + config.phase)
    const waveB = Math.sin(
      t * Math.PI * config.tensionB - time * config.speed * 0.75 + config.phase,
    )
    const y =
      config.baseY + diagonal + waveA * config.amplitude + waveB * config.amplitude * 0.35
    points.push({ x, y })
  }

  return points
}

export function RibbonCurves() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let mounted = true
    let cleanup: (() => void) | undefined

    const run = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const THREE = await import('three')
      if (!mounted) return

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
      camera.position.z = 3

      const interactiveGroup = new THREE.Group()
      scene.add(interactiveGroup)

      const layers = LAYERS.map((config) => {
        const lineGeometry = new THREE.BufferGeometry()
        const glowGeometry = new THREE.BufferGeometry()

        const lineMaterial = new THREE.LineBasicMaterial({
          color: config.color,
          transparent: true,
          opacity: config.opacity,
          blending: THREE.AdditiveBlending,
        })

        const glowMaterial = new THREE.LineBasicMaterial({
          color: config.color,
          transparent: true,
          opacity: config.opacity * 0.34,
          blending: THREE.AdditiveBlending,
        })

        const line = new THREE.Line(lineGeometry, lineMaterial)
        const glow = new THREE.Line(glowGeometry, glowMaterial)
        glow.scale.set(1.01, 1.42, 1)

        interactiveGroup.add(glow)
        interactiveGroup.add(line)

        return { config, line, glow }
      })

      const starPositions = new Float32Array(STAR_COUNT * 3)
      const starColors = new Float32Array(STAR_COUNT * 3)

      for (let index = 0; index < STAR_COUNT; index += 1) {
        const color = new THREE.Color(index % 4 === 0 ? '#9d88ff' : '#86ddff')
        starColors[index * 3] = color.r
        starColors[index * 3 + 1] = color.g
        starColors[index * 3 + 2] = color.b
      }

      const starsGeometry = new THREE.BufferGeometry()
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
      starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

      const starsMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const stars = new THREE.Points(starsGeometry, starsMaterial)
      interactiveGroup.add(stars)

      const backgroundMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uPointerX: { value: 0 },
          uPointerY: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform float uTime;
          uniform float uPointerX;
          uniform float uPointerY;
          void main() {
            vec2 uv = vUv;
            float glowLeft = smoothstep(0.55, -0.1, distance(uv, vec2(0.05, 0.08)));
            float glowRight = smoothstep(0.62, -0.1, distance(uv, vec2(0.92, 0.92)));
            float pulse = 0.5 + 0.5 * sin(uTime * 0.22);
            float pointerInfluence = uPointerX * 0.03 + uPointerY * 0.02;
            float ribbonCenter = 0.16 + uv.x * 0.34 + sin(uv.x * 5.8 + uTime * 0.24) * 0.035 + sin(uv.x * 12.0 - uTime * 0.4) * 0.012 + pointerInfluence;
            float ribbon = exp(-pow((uv.y - ribbonCenter) * 18.0, 2.0));
            float ribbonCore = exp(-pow((uv.y - ribbonCenter) * 34.0, 2.0));
            float ribbonAccent = exp(-pow((uv.y - (ribbonCenter + 0.012)) * 26.0, 2.0));
            vec3 color = vec3(0.02, 0.04, 0.07);
            color += vec3(0.12, 0.22, 0.36) * glowLeft * 1.1;
            color += vec3(0.1, 0.09, 0.24) * glowRight * (0.58 + pulse * 0.24);
            color += vec3(0.14, 0.4, 0.62) * ribbon * 1.18;
            color += vec3(0.84, 0.96, 1.0) * ribbonCore * 0.62;
            color += vec3(0.64, 0.52, 0.96) * ribbonAccent * 0.42;
            float vignette = smoothstep(1.25, 0.3, distance(uv, vec2(0.5, 0.5)));
            color *= 0.72 + vignette * 0.28;
            gl_FragColor = vec4(color, 0.95);
          }
        `,
      })

      const backgroundPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 2.2),
        backgroundMaterial,
      )
      backgroundPlane.position.z = -0.5
      scene.add(backgroundPlane)

      let frame = 0
      const targetPointer = { x: 0, y: 0 }
      const currentPointer = { x: 0, y: 0 }

      const updateCurveGeometry = (
        points: CurvePoint[],
        geometry: import('three').BufferGeometry,
        offsetY: number,
      ) => {
        const positions = new Float32Array(points.length * 3)

        points.forEach((point, index) => {
          positions[index * 3] = point.x
          positions[index * 3 + 1] = point.y + offsetY
          positions[index * 3 + 2] = 0
        })

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      }

      const resize = () => {
        const parent = canvas.parentElement
        const width = parent?.clientWidth ?? window.innerWidth
        const height = parent?.clientHeight ?? 520
        renderer.setSize(width, height, false)

        const aspect = width / Math.max(height, 1)
        camera.left = -aspect
        camera.right = aspect
        camera.top = 1
        camera.bottom = -1
        camera.updateProjectionMatrix()

        backgroundPlane.scale.set(aspect, 1, 1)
      }

      const handlePointerMove = (event: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect()
        const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
        const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1)
        targetPointer.x = (x - 0.5) * 2
        targetPointer.y = (y - 0.5) * -2
      }

      const handlePointerLeave = () => {
        targetPointer.x = 0
        targetPointer.y = 0
      }

      resize()

      const clock = new THREE.Clock()

      const animate = () => {
        const time = clock.getElapsedTime()
        backgroundMaterial.uniforms.uTime.value = time

        currentPointer.x += (targetPointer.x - currentPointer.x) * 0.06
        currentPointer.y += (targetPointer.y - currentPointer.y) * 0.06
        backgroundMaterial.uniforms.uPointerX.value = currentPointer.x
        backgroundMaterial.uniforms.uPointerY.value = currentPointer.y
        interactiveGroup.position.x = currentPointer.x * 0.05
        interactiveGroup.position.y = currentPointer.y * 0.035
        interactiveGroup.rotation.z = currentPointer.x * 0.035

        const leadCurvePoints: CurvePoint[] = []

        layers.forEach((layer, layerIndex) => {
          const points = buildCurvePoints(layer.config, time)
          if (layerIndex === 0) {
            leadCurvePoints.push(...points)
          }
          updateCurveGeometry(points, layer.line.geometry, 0)
          updateCurveGeometry(
            points,
            layer.glow.geometry,
            Math.sin(time * 0.4 + layerIndex) * 0.004,
          )
        })

        const positions = stars.geometry.getAttribute('position') as import('three').BufferAttribute
        if (leadCurvePoints.length > 0) {
          for (let index = 0; index < STAR_COUNT; index += 1) {
            const sampleIndex = Math.min(
              leadCurvePoints.length - 1,
              Math.max(
                0,
                Math.round(((index + 1) / (STAR_COUNT + 1)) * (leadCurvePoints.length - 1)),
              ),
            )
            const point = leadCurvePoints[sampleIndex]
            positions.array[index * 3] = point.x + Math.sin(time * 0.3 + index) * 0.02
            positions.array[index * 3 + 1] =
              point.y +
              Math.cos(time * 0.7 + index * 0.8) * 0.03 +
              (index % 2 === 0 ? 0.02 : -0.01)
          }
        }
        positions.needsUpdate = true

        renderer.render(scene, camera)
        frame = window.requestAnimationFrame(animate)
      }

      const resizeObserver = new ResizeObserver(() => resize())
      const parent = canvas.parentElement
      if (parent) resizeObserver.observe(parent)
      canvas.addEventListener('pointermove', handlePointerMove)
      canvas.addEventListener('pointerleave', handlePointerLeave)
      window.addEventListener('resize', resize)

      animate()

      cleanup = () => {
        window.cancelAnimationFrame(frame)
        resizeObserver.disconnect()
        window.removeEventListener('resize', resize)
        canvas.removeEventListener('pointermove', handlePointerMove)
        canvas.removeEventListener('pointerleave', handlePointerLeave)
        renderer.dispose()

        layers.forEach((layer) => {
          layer.line.geometry.dispose()
          layer.glow.geometry.dispose()
          layer.line.material.dispose()
          layer.glow.material.dispose()
        })

        stars.geometry.dispose()
        stars.material.dispose()
        backgroundPlane.geometry.dispose()
        backgroundMaterial.dispose()
        scene.clear()
      }
    }

    void run()

    return () => {
      mounted = false
      cleanup?.()
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas className="pointer-events-auto block h-full w-full opacity-95" ref={canvasRef} />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-[#070910]/45 to-[#090b11]" />
    </div>
  )
}
