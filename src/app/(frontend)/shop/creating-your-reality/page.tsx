import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { creatingYourRealityConfig as product } from '@/config/creatingYourReality'
import { canonicalUrlForPath } from '@/utilities/siteMetadata'

export const metadata: Metadata = {
  title: 'Creating Your Reality + TimeBite | Erin Pangilinan',
  description:
    'Explore TimeBite and the Creating Your Reality planner, a connected digital and physical system for planning time, goals and reflection.',
  alternates: {
    canonical: canonicalUrlForPath(product.route),
  },
  openGraph: {
    title: 'Creating Your Reality + TimeBite | Erin Pangilinan',
    description:
      'A connected digital and physical system for planning time, goals and reflection.',
    url: canonicalUrlForPath(product.route),
    images: [{ url: '/media/create-your-reality-planner-mock-1200x630.png' }],
  },
}

const digitalItems = ['Intention', 'Calendar', 'Execution', 'Timers', 'Activity rings', 'Reflection']
const physicalItems = ['Vision', 'Annual goals', 'Quarterly GROW', 'Monthly systems', 'Weekly priorities', 'Journal / reflection']

function ProductRow({
  eyebrow,
  title,
  price,
  status,
  children,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  eyebrow: string
  title: string
  price: string
  status?: string
  children: React.ReactNode
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}) {
  return (
    <article className="flex flex-col gap-5 border-t border-white/15 py-7 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">{eyebrow}</p>
        <h2 className="mt-2 font-title text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">{children}</p>
        {status ? <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-white/45">{status}</p> : null}
      </div>
      <div className="flex flex-col items-start gap-3 sm:items-end">
        <p className="text-lg font-semibold text-white">{price}</p>
        <div className="flex flex-wrap gap-3 sm:justify-end">
          <Button asChild size="sm">
            <Link href={primaryHref} target={primaryHref.startsWith('http') ? '_blank' : undefined} rel={primaryHref.startsWith('http') ? 'noopener noreferrer' : undefined}>
              {primaryLabel}
            </Link>
          </Button>
          {secondaryLabel && secondaryHref ? (
            <Button asChild size="sm" variant="outline">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function SystemColumn({ label, title, items }: { label: string; title: string; items: string[] }) {
  return (
    <div className="rounded-none border border-white/12 bg-white/[0.035] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/70">{label}</p>
      <h3 className="mt-3 font-title text-2xl font-semibold text-white">{title}</h3>
      <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-white/65">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}

export default function CreatingYourRealityPage() {
  return (
    <main className="bg-[#080d18] text-white">
      <div className="container py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.18em] text-white/45">
          <Link href="/store" className="hover:text-white">Shop</Link>
          <span className="px-2">/</span>
          <span>Creating Your Reality</span>
        </nav>

        <section className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:items-center lg:gap-20 lg:py-20">
          <div className="order-2 lg:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/75">A planning system by Erin Jerri</p>
            <h1 className="mt-5 max-w-3xl font-title text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-7xl">Creating Your Reality</h1>
            <p className="mt-6 max-w-xl text-xl leading-8 text-white/75">TimeBite for execution. A physical planner for perspective.</p>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/60">A connected system for turning vision into goals, time, action, and reflection. The app launches first; the physical CYR planner is its annual companion away from the screen.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href={product.app.exploreURL}>Explore TimeBite</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href={product.planner.productURL} target="_blank" rel="noopener noreferrer">Reserve your planner</Link></Button>
            </div>
          </div>
          <div className="order-1 relative mx-auto w-full max-w-[34rem] lg:order-2">
            <div className="absolute -inset-8 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden="true" />
            <Image src="/media/create-your-reality-planner-mock-1200x630.png" alt="Conceptual Creating Your Reality planner cover" width={1200} height={630} priority className="relative w-full border border-white/15 object-cover" sizes="(max-width: 1024px) 92vw, 42vw" />
          </div>
        </section>

        <section aria-labelledby="shop-choices" className="py-10 sm:py-16">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Choose your mode</p>
              <h2 id="shop-choices" className="mt-2 font-title text-3xl font-semibold">The system, in parts</h2>
            </div>
            <span className="hidden text-sm text-white/40 sm:block">Prices are configurable and subject to change.</span>
          </div>
          <ProductRow eyebrow="Digital planning" title="TimeBite" price={`From free`} primaryLabel="Explore TimeBite" primaryHref={product.app.exploreURL} secondaryLabel="View pricing" secondaryHref={product.app.pricingURL}>
            Digital planning and execution across the Apple ecosystem, with premium tiers for deeper workflows.
          </ProductRow>
          <ProductRow eyebrow="Physical companion" title="Creating Your Reality Planner" price={product.planner.retailPrice} status={product.planner.status} primaryLabel="Reserve your planner" primaryHref={product.planner.productURL}>
            An annual physical companion for vision, quarterly growth, monthly systems, weekly priorities, and reflection. Preorder pricing is not final.
          </ProductRow>
          <ProductRow eyebrow="Future system" title="TimeBite + CYR" price={product.bundle.price} status={product.bundle.status} primaryLabel="Learn about the system" primaryHref="#system">
            A future combined annual bundle for people who want both the digital execution layer and physical perspective.
          </ProductRow>
        </section>

        <section id="system" aria-labelledby="system-heading" className="border-y border-white/12 py-12 sm:py-16">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-cyan-200/70">One planning system, two modes</p>
          <h2 id="system-heading" className="mx-auto mt-3 max-w-2xl text-center font-title text-3xl font-semibold sm:text-4xl">Plan at the scale of a year. Act at the scale of now.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <SystemColumn label="Digital" title="TimeBite" items={digitalItems} />
            <SystemColumn label="Physical" title="CYR Planner" items={physicalItems} />
          </div>
          <p className="mt-10 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white/55">Vision <span className="px-2 text-cyan-200">→</span> Grow <span className="px-2 text-cyan-200">→</span> Systems <span className="px-2 text-cyan-200">→</span> Priorities <span className="px-2 text-cyan-200">→</span> TimeBites <span className="px-2 text-cyan-200">→</span> Reflection</p>
        </section>

        <section className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Designed by Erin Jerri</p>
            <h2 className="mt-3 max-w-2xl font-title text-3xl font-semibold sm:text-4xl">A product system shaped by software, design, and real life.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">Creating Your Reality brings together my work across software engineering, product design, spatial computing, and personal planning.</p>
          </div>
          <Button asChild variant="outline"><Link href="/about">About Erin</Link></Button>
        </section>
      </div>
    </main>
  )
}
