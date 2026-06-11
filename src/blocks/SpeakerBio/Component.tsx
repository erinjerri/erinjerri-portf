'use client'

import { useState } from 'react'

type BioLength = 'short' | 'medium' | 'long'

type SpeakerBioBlockProps = {
  shortBio?: string | null
  mediumBio?: string | null
  longBio?: string | null
}

const bioOptions: { id: BioLength; label: string }[] = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
]

export const SpeakerBioBlock: React.FC<SpeakerBioBlockProps> = ({
  shortBio,
  mediumBio,
  longBio,
}) => {
  const [activeBio, setActiveBio] = useState<BioLength>('short')
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')

  const bioText = {
    short: shortBio?.trim() ?? '',
    medium: mediumBio?.trim() ?? '',
    long: longBio?.trim() ?? '',
  }[activeBio]

  async function copyBio() {
    try {
      await navigator.clipboard.writeText(bioText)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = bioText
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopyState('copied')
    window.setTimeout(() => setCopyState('idle'), 2000)
  }

  if (!shortBio?.trim() && !mediumBio?.trim() && !longBio?.trim()) return null

  return (
    <section className="container my-16 text-foreground">
      <div className="rounded-sm border border-current/15 bg-background/60 p-5 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <button
            className="inline-flex w-fit items-center justify-center rounded-sm border border-current px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30"
            disabled={!bioText}
            onClick={copyBio}
            type="button"
          >
            {copyState === 'copied' ? 'Copied!' : 'Copy Bio'}
          </button>

          <div className="flex flex-wrap justify-end gap-2">
            {bioOptions.map((option) => {
              const isActive = option.id === activeBio

              return (
                <button
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? 'rounded-sm border border-foreground bg-foreground px-3 py-1 text-xs font-semibold uppercase tracking-wider text-background transition-colors'
                      : 'rounded-sm border border-current px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/80 transition-colors hover:bg-foreground hover:text-background'
                  }
                  key={option.id}
                  onClick={() => setActiveBio(option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <p
          className="mt-6 max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-foreground/85"
          style={{ fontSize: '16px', lineHeight: '1.625' }}
        >
          {bioText}
        </p>
      </div>
    </section>
  )
}
