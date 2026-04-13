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
  width: number
}

type CurvePoint = { x: number; y: number }

const LAYERS: CurveLayer[] = [
  {
    baseY: 0.34,
    amplitude: 0.085,
    speed: 0.34,
    color: '#e7fbff',
    opacity: 0.95,
    tensionA: 1.5,
    tensionB: 3.15,
    phase: 0.35,
    slope: 0.54,
    width: 1.8,
  },
  {
    baseY: 0.48,
    amplitude: 0.1,
    speed: 0.26,
    color: '#9de9ff',
    opacity: 0.84,
    tensionA: 1.22,
    tensionB: 2.72,
    phase: 1.55,
    slope: 0.46,
    width: 1.5,
  },
  {
    baseY: 0.23,
    amplitude: 0.11,
    speed: 0.21,
    color: '#beaaff',
    opacity: 0.62,
    tensionA: 1.08,
    tensionB: 2.32,
    phase: 2.08,
    slope: 0.22,
    width: 1.28,
  },
  {
    baseY: 0.62,
    amplitude: 0.074,
    speed: 0.16,
    color: '#7dd9ff',
    opacity: 0.42,
    tensionA: 0.94,
    tensionB: 2.44,
    phase: 0.88,
    slope: 0.17,
    width: 1.1,
  },
  {
    baseY: 0.1,
    amplitude: 0.058,
    speed: 0.12,
    color: '#d2ebff',
    opacity: 0.28,
    tensionA: 0.9,
    tensionB: 2.08,
    phase: 2.72,
    slope: 0.1,
    width: 0.95,
  },
]

const CURVE_POINT_COUNT = 180
const STAR_COUNT = 42

function buildCurvePoints(
  config: CurveLayer,
  time: number,
  width: number,
  height: number,
  pointerX: number,
  pointerY: number,
): CurvePoint[] {
  const points: CurvePoint[] = []

  for (let index = 0; index < CURVE_POINT_COUNT; index += 1) {
    const t = index / (CURVE_POINT_COUNT - 1)
    const x = t * width
    const diagonal = (t - 0.5) * config.slope
    const waveA = Math.sin(t * Math.PI * config.tensionA + time * config.speed + config.phase)
    const waveB = Math.sin(
      t * Math.PI * config.tensionB - time * config.speed * 0.75 + config.phase,
    )
    const normalizedY =
      config.baseY +
      diagonal +
      waveA * config.amplitude +
      waveB * config.amplitude * 0.35 +
      pointerX * 0.014 +
      pointerY * 0.01

    points.push({
      x,
      y: normalizedY * height,
    })
  }

  return points
}

function traceCurve(ctx: CanvasRenderingContext2D, points: CurvePoint[]) {
  if (!points.length) return

  ctx.beginPath()
  ctx.moveTo(points[0]!.x, points[0]!.y)

  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index]!
    const next = points[index + 1]!
    const controlX = (point.x + next.x) / 2
    const controlY = (point.y + next.y) / 2
    ctx.quadraticCurveTo(point.x, point.y, controlX, controlY)
  }

  const last = points[points.length - 1]!
  ctx.lineTo(last.x, last.y)
}

function drawGlowLine(
  ctx: CanvasRenderingContext2D,
  points: CurvePoint[],
  color: string,
  opacity: number,
  width: number,
  /** Scroll / readability: 0–1, scales all passes (ambient site-wide layer). */
  intensityMul = 1,
) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const m = intensityMul
  ctx.globalAlpha = opacity * 0.12 * m
  ctx.lineWidth = width * 18
  ctx.shadowBlur = width * 34
  ctx.shadowColor = color
  traceCurve(ctx, points)
  ctx.stroke()

  ctx.globalAlpha = opacity * 0.24 * m
  ctx.lineWidth = width * 8
  ctx.shadowBlur = width * 18
  traceCurve(ctx, points)
  ctx.stroke()

  ctx.globalAlpha = opacity * m
  ctx.lineWidth = width * 2.2
  ctx.shadowBlur = width * 8
  traceCurve(ctx, points)
  ctx.stroke()

  ctx.restore()
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number,
) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = alpha

  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4)
  glow.addColorStop(0, color)
  glow.addColorStop(0.25, color)
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, y, radius * 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x - radius * 3.3, y)
  ctx.lineTo(x + radius * 3.3, y)
  ctx.moveTo(x, y - radius * 3.3)
  ctx.lineTo(x, y + radius * 3.3)
  ctx.stroke()
  ctx.restore()
}

/** After this many px scroll, ambient hero blend hits 0 (stars gone; curves/radials at floor). */
const AMBIENT_SCROLL_BLEND_RANGE_PX = 400

/** Match CSS mobile hero / readability breakpoints. */
const MOBILE_MAX_WIDTH_MQ = '(max-width: 768px)'

type MotionPrefs = { mobile: boolean; reduceMotion: boolean }

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  pointerX: number,
  pointerY: number,
  variant: 'full' | 'ambient',
  /** 1 = top of page, 0 = scrolled — dims radials for `ambient` only. */
  heroBlend: number,
) {
  ctx.clearRect(0, 0, width, height)

  if (variant === 'full') {
    const baseGradient = ctx.createLinearGradient(0, 0, 0, height)
    baseGradient.addColorStop(0, '#07101d')
    baseGradient.addColorStop(0.42, '#060b13')
    baseGradient.addColorStop(1, '#070910')
    ctx.fillStyle = baseGradient
    ctx.fillRect(0, 0, width, height)
  }

  const radialMul =
    variant === 'ambient' ? (0.72 * heroBlend + 0.28) * 0.85 : 1

  const leftGlow = ctx.createRadialGradient(
    width * (0.1 + pointerX * 0.02),
    height * (0.08 - pointerY * 0.02),
    0,
    width * 0.1,
    height * 0.08,
    width * 0.46,
  )
  leftGlow.addColorStop(0, `rgba(110, 188, 255, ${0.26 * radialMul})`)
  leftGlow.addColorStop(0.42, `rgba(60, 120, 210, ${0.14 * radialMul})`)
  leftGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = leftGlow
  ctx.fillRect(0, 0, width, height)

  const rightGlow = ctx.createRadialGradient(
    width * 0.88,
    height * 0.92,
    0,
    width * 0.88,
    height * 0.92,
    width * 0.42,
  )
  rightGlow.addColorStop(0, `rgba(142, 116, 255, ${0.18 * radialMul})`)
  rightGlow.addColorStop(0.4, `rgba(94, 76, 180, ${0.11 * radialMul})`)
  rightGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = rightGlow
  ctx.fillRect(0, 0, width, height)

  // Traveling horizontal “band” — kept for `full` hero only; removed for site-wide `ambient`
  // so it doesn’t read as a bright slab over body text while scrolling.
  if (variant === 'full') {
    const ribbonY =
      height *
      (0.22 +
        0.26 * 0.5 +
        Math.sin(time * 0.26) * 0.026 +
        pointerX * 0.012 +
        pointerY * 0.01)
    const ribbonGradient = ctx.createLinearGradient(0, ribbonY - 90, width, ribbonY + 90)
    ribbonGradient.addColorStop(0, 'rgba(120, 214, 255, 0)')
    ribbonGradient.addColorStop(0.34, 'rgba(116, 215, 255, 0.14)')
    ribbonGradient.addColorStop(0.55, 'rgba(218, 247, 255, 0.18)')
    ribbonGradient.addColorStop(0.76, 'rgba(168, 154, 255, 0.12)')
    ribbonGradient.addColorStop(1, 'rgba(162, 132, 255, 0)')
    ctx.fillStyle = ribbonGradient
    ctx.fillRect(0, ribbonY - 120, width, 240)
  }
}

type RibbonCurvesProps = {
  /** `ambient`: transparent base — for fixed site-wide layer over existing page bg. */
  variant?: 'full' | 'ambient'
}

const MOBILE_TIME_SCALE = 0.8

export function RibbonCurves({ variant = 'full' }: RibbonCurvesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scrollYRef = useRef(0)
  const motionPrefsRef = useRef<MotionPrefs>({
    mobile: false,
    reduceMotion: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let width = 0
    let height = 0
    const pointerTarget = { x: 0, y: 0 }
    const pointerCurrent = { x: 0, y: 0 }

    const syncScroll = () => {
      scrollYRef.current = window.scrollY
    }
    syncScroll()
    window.addEventListener('scroll', syncScroll, { passive: true })

    const mMobile = window.matchMedia(MOBILE_MAX_WIDTH_MQ)
    const mReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => {
      motionPrefsRef.current = {
        mobile: mMobile.matches,
        reduceMotion: mReduce.matches,
      }
    }
    syncMotion()
    mMobile.addEventListener('change', syncMotion)
    mReduce.addEventListener('change', syncMotion)

    const resize = () => {
      const parent = canvas.parentElement
      const nextWidth = parent?.clientWidth ?? window.innerWidth
      const nextHeight = parent?.clientHeight ?? 520
      const isMobileViewport = window.matchMedia(MOBILE_MAX_WIDTH_MQ).matches
      const dpr = Math.min(window.devicePixelRatio || 1, isMobileViewport ? 1.5 : 2)

      width = nextWidth
      height = nextHeight

      canvas.width = Math.round(nextWidth * dpr)
      canvas.height = Math.round(nextHeight * dpr)
      canvas.style.width = `${nextWidth}px`
      canvas.style.height = `${nextHeight}px`

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
      const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1)
      pointerTarget.x = (x - 0.5) * 2
      pointerTarget.y = (y - 0.5) * -2
    }

    const handlePointerLeave = () => {
      pointerTarget.x = 0
      pointerTarget.y = 0
    }

    resize()

    /** Cap ~30fps on narrow viewports to reduce main-thread work (Lighthouse TBT). */
    let lastFrameTimeMs = 0
    const MOBILE_FRAME_INTERVAL_MS = 1000 / 30

    const render = (now?: number) => {
      const ts = typeof now === 'number' ? now : performance.now()
      const { mobile, reduceMotion } = motionPrefsRef.current
      if (mobile && !reduceMotion && ts - lastFrameTimeMs < MOBILE_FRAME_INTERVAL_MS * 0.92) {
        frame = window.requestAnimationFrame(render)
        return
      }
      lastFrameTimeMs = ts

      const rawT = ts / 1000
      const time = reduceMotion ? 0 : mobile ? rawT * MOBILE_TIME_SCALE : rawT

      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.06
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.06

      const heroBlend =
        variant === 'ambient'
          ? Math.max(0, Math.min(1, 1 - scrollYRef.current / AMBIENT_SCROLL_BLEND_RANGE_PX))
          : 1

      const curveIntensity =
        variant === 'ambient' ? 0.18 + 0.82 * heroBlend : 1

      drawBackground(
        ctx,
        width,
        height,
        time,
        pointerCurrent.x,
        pointerCurrent.y,
        variant,
        heroBlend,
      )

      const leadCurves: CurvePoint[][] = []

      for (const [index, layer] of LAYERS.entries()) {
        const points = buildCurvePoints(
          layer,
          time,
          width,
          height,
          pointerCurrent.x,
          pointerCurrent.y,
        )

        const drifted = points.map((point) => ({
          x: point.x,
          y: point.y + Math.sin(time * (0.38 + index * 0.06) + index) * (6 + index * 1.4),
        }))

        if (index < 3) leadCurves.push(drifted)
        drawGlowLine(
          ctx,
          drifted,
          layer.color,
          layer.opacity,
          layer.width,
          curveIntensity,
        )
      }

      const starMul =
        variant === 'ambient' ? Math.pow(heroBlend, 1.45) : 1

      const guide = leadCurves[0] ?? []
      if (guide.length && starMul > 0.02) {
        for (let index = 0; index < STAR_COUNT; index += 1) {
          const t = (index + 1) / (STAR_COUNT + 1)
          const sampleIndex = Math.min(
            guide.length - 1,
            Math.max(0, Math.round(t * (guide.length - 1))),
          )
          const point = guide[sampleIndex]!
          const orbit = Math.sin(time * 0.8 + index * 0.6) * 10
          const color = index % 4 === 0 ? '#bfa7ff' : '#88e7ff'
          drawStar(
            ctx,
            point.x + Math.sin(time * 0.4 + index) * 11,
            point.y + orbit + (index % 2 === 0 ? 9 : -5),
            index % 5 === 0 ? 2.4 : 1.8,
            color,
            0.95 * starMul,
          )
        }
      }

      frame = window.requestAnimationFrame(render)
    }

    const resizeObserver = new ResizeObserver(() => resize())
    const parent = canvas.parentElement
    if (parent) resizeObserver.observe(parent)
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerleave', handlePointerLeave)

    frame = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', syncScroll)
      mMobile.removeEventListener('change', syncMotion)
      mReduce.removeEventListener('change', syncMotion)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [variant])

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <canvas
        className={
          variant === 'ambient'
            ? 'pointer-events-none block h-full w-full opacity-100'
            : 'pointer-events-auto block h-full w-full opacity-100'
        }
        ref={canvasRef}
      />
      {variant === 'full' ? (
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-[#070910]/20 to-[#070910]" />
      ) : null}
    </div>
  )
}
