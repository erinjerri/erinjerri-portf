'use client'

// Intended for the About page only — do not add to the home page layout
import { Media } from '@/components/Media'
import type { ComponentProps } from 'react'
import { useMemo, useState } from 'react'

type BioLength = 'short' | 'medium' | 'long'
type PhotoItem = { photo: any; caption?: string | null; id?: string | null }

type SpeakerKitBlockProps = {
  sectionTitle?: string | null
  shortBio?: string | null
  mediumBio?: string | null
  longBio?: string | null
  photos?: PhotoItem[] | null
  photoHeading?: string | null
  downloadable?: boolean | null
}

const bioOptions: { id: BioLength; label: string }[] = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
]

type MediaResourceProp = ComponentProps<typeof Media>['resource']

function getPhotoUrl(photo: any) {
  if (!photo || typeof photo === 'number') return null
  if (typeof photo === 'string') return photo
  if (typeof photo.url === 'string' && photo.url.trim()) return photo.url
  if (typeof photo.filename === 'string' && photo.filename.trim()) {
    return `/api/media/file/${encodeURIComponent(photo.filename)}`
  }
  return null
}

function getPhotoAlt(photo: any) {
  return typeof photo?.alt === 'string' && photo.alt.trim() ? photo.alt : 'Headshot'
}

export const SpeakerKitBlock: React.FC<SpeakerKitBlockProps> = ({
  sectionTitle = 'Speaker Kit',
  shortBio,
  mediumBio,
  longBio,
  photos,
  photoHeading = 'Speaker Kit Headshots',
  downloadable,
}) => {
  const [activeBio, setActiveBio] = useState<BioLength>('short')
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  const bioText = {
    short: shortBio?.trim() ?? '',
    medium: mediumBio?.trim() ?? '',
    long: longBio?.trim() ?? '',
  }[activeBio]

  const visiblePhotos = useMemo(
    () => (photos ?? []).filter((item) => Boolean(getPhotoUrl(item?.photo))),
    [photos],
  )

  const activePhoto = visiblePhotos[activePhotoIndex] ?? visiblePhotos[0]
  const photoUrl = getPhotoUrl(activePhoto?.photo)
  const hasMultiplePhotos = visiblePhotos.length > 1

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

  function movePhoto(direction: -1 | 1) {
    if (!visiblePhotos.length) return
    setActivePhotoIndex(
      (currentIndex) => (currentIndex + direction + visiblePhotos.length) % visiblePhotos.length,
    )
  }

  if (!bioText && !photoUrl) return null

  return (
    <section className="container py-16 text-foreground">
      {sectionTitle?.trim() ? (
        <h2 className="mb-10 text-2xl font-semibold">{sectionTitle.trim()}</h2>
      ) : null}

      <div>
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

      {photoUrl ? (
        <>
          <hr className="my-10 border-t border-current opacity-20" />

          <div className="w-full max-w-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/60">
              {photoHeading}
            </p>

            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
              <Media
                alt={getPhotoAlt(activePhoto.photo)}
                fill
                imgClassName="object-cover w-full h-full"
                resource={activePhoto.photo as MediaResourceProp}
                size="(max-width: 1024px) min(100vw, 24rem), 24rem"
              />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                aria-label="Previous headshot"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-sm border border-current text-lg transition hover:bg-foreground hover:text-background ${
                  hasMultiplePhotos ? '' : 'pointer-events-none opacity-30'
                }`}
                onClick={() => movePhoto(-1)}
                type="button"
              >
                ←
              </button>
              <span className="min-w-14 text-center text-sm opacity-60">
                {activePhotoIndex + 1} / {visiblePhotos.length}
              </span>
              <button
                aria-label="Next headshot"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-sm border border-current text-lg transition hover:bg-foreground hover:text-background ${
                  hasMultiplePhotos ? '' : 'pointer-events-none opacity-30'
                }`}
                onClick={() => movePhoto(1)}
                type="button"
              >
                →
              </button>
            </div>

            {activePhoto.caption?.trim() ? (
              <p className="mt-2 text-xs italic opacity-60">{activePhoto.caption.trim()}</p>
            ) : null}

            {downloadable ? (
              <a
                className="mt-3 inline-flex items-center gap-1 rounded-sm border border-current px-4 py-1.5 text-sm transition-colors hover:bg-foreground hover:text-background"
                download
                href={photoUrl}
              >
                ↓ Download
              </a>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  )
}
