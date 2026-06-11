import Link from 'next/link'
import React from 'react'

type PoetryLayoutProps = {
  children: React.ReactNode
  eyebrow?: string
  title: string
  description?: string
}

export function PoetryLayout({ children, eyebrow = 'Poetry', title, description }: PoetryLayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70 bg-background">
        <div className="container max-w-5xl px-6 pb-12 pt-10 md:pb-16 md:pt-14">
          <nav className="mb-14 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <Link
              className="font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-foreground/70"
              href="/poetry"
              prefetch={false}
            >
              Erin Jerri Poetry
            </Link>
            <Link
              className="transition-colors hover:text-foreground"
              href="https://erinjerri.com"
              prefetch={false}
            >
              ErinJerri.com
            </Link>
          </nav>

          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl font-title text-5xl font-normal leading-tight md:text-7xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl md:leading-9">
              {description}
            </p>
          ) : null}
        </div>
      </section>

      {children}
    </main>
  )
}
