'use client'

import dynamic from 'next/dynamic'
import React, { useEffect, useMemo, useRef, useState } from 'react'

type HeroAnimationVariant = 'lite' | 'full'

type ConnectionLike = {
  saveData?: boolean
  effectiveType?: string
}

type NavigatorWithHints = Navigator & {
  connection?: ConnectionLike
  deviceMemory?: number
}

const HeroAnimationLite = dynamic(() => import('@/components/HeroAnimationLite'), {
  ssr: false,
  loading: () => <HeroAnimationFallback />,
})

const HeroAnimationFull = dynamic(() => import('@/components/HeroAnimationFull'), {
  ssr: false,
  loading: () => <HeroAnimationFallback />,
})

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isLowPowerDevice() {
  const nav = navigator as NavigatorWithHints
  const connection = nav.connection
  const slowConnection =
    connection?.saveData === true ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g'

  return Boolean(
    prefersReducedMotion() ||
      slowConnection ||
      (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) ||
      (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4),
  )
}

function isDesktopViewport() {
  return window.matchMedia('(min-width: 1024px)').matches
}

export function HeroAnimationFallback() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 86% 32%, rgba(92, 211, 186, 0.18), transparent 22rem), radial-gradient(circle at 92% 58%, rgba(242, 146, 112, 0.12), transparent 20rem), linear-gradient(135deg, rgba(9, 16, 31, 0.22), rgba(12, 22, 42, 0.04))',
      }}
    />
  )
}

function HeroAnimationOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'linear-gradient(90deg, rgba(6, 12, 24, 0.64) 0%, rgba(6, 12, 24, 0.42) 38%, rgba(6, 12, 24, 0.16) 72%, rgba(6, 12, 24, 0.34) 100%), radial-gradient(circle at 18% 48%, rgba(6, 12, 24, 0.48), transparent 30rem), linear-gradient(180deg, rgba(6, 12, 24, 0.2), rgba(6, 12, 24, 0.44))',
      }}
    />
  )
}

export function HeroAnimation() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [inViewport, setInViewport] = useState(false)
  const [variant, setVariant] = useState<HeroAnimationVariant>('lite')
  const [useStaticFallback, setUseStaticFallback] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUseStaticFallback(isLowPowerDevice())
    setVariant(isDesktopViewport() ? 'full' : 'lite')

    const media = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setVariant(media.matches ? 'full' : 'lite')
    media.addEventListener('change', onChange)

    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!mounted || !rootRef.current || useStaticFallback) return

    const node = rootRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInViewport(Boolean(entry?.isIntersecting))
      },
      { rootMargin: '240px 0px', threshold: 0.01 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [mounted, useStaticFallback])

  const AnimatedComponent = useMemo(
    () => (variant === 'full' ? HeroAnimationFull : HeroAnimationLite),
    [variant],
  )

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <HeroAnimationFallback />
      {mounted && inViewport && !useStaticFallback ? <AnimatedComponent /> : null}
      <HeroAnimationOverlay />
    </div>
  )
}
