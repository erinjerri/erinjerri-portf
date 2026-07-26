'use client'

import type { BioVariant } from './bioVariants'

import { cn } from '@/utilities/ui'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { useId, useRef, useState } from 'react'

type SpeakerBioKitProps = {
  variants: BioVariant[]
}

export function SpeakerBioKit({ variants }: SpeakerBioKitProps) {
  const [activeId, setActiveId] = useState(variants[0]?.id)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reactId = useId()

  const activeIndex = Math.max(
    variants.findIndex((variant) => variant.id === activeId),
    0,
  )
  const activeVariant = variants[activeIndex]

  if (!activeVariant) return null

  async function copyBio() {
    try {
      await navigator.clipboard.writeText(activeVariant.copy)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = activeVariant.copy
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopiedId(activeVariant.id)
    window.setTimeout(() => setCopiedId(null), 1600)
  }

  function focusTab(index: number) {
    const nextIndex = (index + variants.length) % variants.length
    const nextVariant = variants[nextIndex]

    if (!nextVariant) return

    setActiveId(nextVariant.id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section
      aria-labelledby={`${reactId}-heading`}
      className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/95 p-3 text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:mt-16 md:p-4"
    >
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5 md:px-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            Speaker Bio Kit
          </p>
          <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h2
                className="font-title text-3xl font-normal leading-tight text-slate-950 md:text-4xl"
                id={`${reactId}-heading`}
              >
                Copy-ready bios for organizers and media teams
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Choose the length that fits the format, then copy the final text in one click.
              </p>
            </div>
            <div className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 lg:block">
              {variants.length} versions
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <div
            aria-label="Bio versions"
            className="flex gap-2 overflow-x-auto border-b border-slate-200 p-3 lg:block lg:overflow-visible lg:border-b-0 lg:border-r"
            role="tablist"
          >
            {variants.map((variant, index) => {
              const isActive = variant.id === activeVariant.id

              return (
                <button
                  aria-controls={`${reactId}-panel-${variant.id}`}
                  aria-selected={isActive}
                  className={cn(
                    'min-w-[11.5rem] rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 lg:w-full',
                    index > 0 && 'lg:mt-2',
                    isActive
                      ? 'border-teal-200 bg-teal-50 text-slate-950 shadow-sm'
                      : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950',
                  )}
                  id={`${reactId}-tab-${variant.id}`}
                  key={variant.id}
                  onClick={() => setActiveId(variant.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                      event.preventDefault()
                      focusTab(index + 1)
                    }

                    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                      event.preventDefault()
                      focusTab(index - 1)
                    }

                    if (event.key === 'Home') {
                      event.preventDefault()
                      focusTab(0)
                    }

                    if (event.key === 'End') {
                      event.preventDefault()
                      focusTab(variants.length - 1)
                    }
                  }}
                  ref={(node) => {
                    tabRefs.current[index] = node
                  }}
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                >
                  <span className="block text-sm font-semibold">{variant.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {variant.bestFor}
                  </span>
                </button>
              )
            })}
          </div>

          <div
            aria-labelledby={`${reactId}-tab-${activeVariant.id}`}
            className="p-5 md:p-7"
            id={`${reactId}-panel-${activeVariant.id}`}
            role="tabpanel"
            tabIndex={0}
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">{activeVariant.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  <span className="font-medium text-slate-700">Best for:</span>{' '}
                  {activeVariant.bestFor}
                </p>
              </div>
              <button
                aria-label={`Copy ${activeVariant.label}`}
                className="inline-flex h-10 min-w-[7.75rem] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                onClick={copyBio}
                type="button"
              >
                {copiedId === activeVariant.id ? (
                  <>
                    <CheckIcon aria-hidden="true" className="h-4 w-4 text-teal-700" />
                    Copied
                  </>
                ) : (
                  <>
                    <CopyIcon aria-hidden="true" className="h-4 w-4" />
                    Copy bio
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 min-h-[15rem] rounded-lg border border-slate-200 bg-slate-50 p-4 md:min-h-[17rem] md:p-5">
              <p className="whitespace-pre-wrap text-base leading-8 text-slate-700">
                {activeVariant.copy}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
