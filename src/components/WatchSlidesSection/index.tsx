'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { PdfViewer } from '@/components/PdfViewer/PdfViewer'
import { getDocumentUrl } from '@/utilities/getDocumentUrl'

type SlidesDoc = {
  id?: string
  url?: string | null
  filename?: string | null
  title?: string | null
  allowDownload?: boolean | null
  description?: string | null
  externalEmbedUrl?: string | null
}

type Props = {
  document: SlidesDoc
  className?: string
}

export const WatchSlidesSection: React.FC<Props> = ({ document: doc, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!doc || typeof doc !== 'object') return null

  const pdfUrl = getDocumentUrl(
    typeof doc.url === 'string' ? doc.url : null,
    doc.filename,
  )
  const downloadFilename = doc.filename || `${doc.title || 'slides'}.pdf`

  const handleDownload = () => {
    const link = window.document.createElement('a')
    link.href = pdfUrl
    link.download = downloadFilename
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  }

  return (
    <section className={className}>
      <h2 className="text-xl font-semibold mb-4">Slides</h2>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-sky-500 hover:text-sky-400 hover:underline font-medium transition-colors"
        >
          {isExpanded ? (
            <>
              Hide slides
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              View slides
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
        <a
          href={pdfUrl}
          onClick={(e) => {
            e.preventDefault()
            handleDownload()
          }}
          className="inline-flex items-center gap-1 text-sky-500 hover:text-sky-400 hover:underline font-medium transition-colors"
        >
          Download slides
          <span aria-hidden> →</span>
        </a>
      </div>
      {isExpanded && (
        <div className="mt-4">
          <PdfViewer document={doc} />
        </div>
      )}
    </section>
  )
}
