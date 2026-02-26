'use client'

import React, { useState } from 'react'
import { getDocumentUrl } from '@/utilities/getDocumentUrl'

import './PdfViewer.css'

type DocumentDoc = {
  url?: string | null
  filename?: string | null
  title?: string | null
  allowDownload?: boolean | null
  description?: string | null
  externalEmbedUrl?: string | null
}

type PdfViewerProps = {
  document: DocumentDoc
  className?: string
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  document,
  className = '',
}) => {
  const [embedFailed, setEmbedFailed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const pdfUrl = getDocumentUrl(
    typeof document.url === 'string' ? document.url : null,
    document.filename,
  )
  const embedSrc = document.externalEmbedUrl || pdfUrl

  const handleDownload = () => {
    const link = window.document.createElement('a')
    link.href = pdfUrl
    link.download = document.filename || `${document.title}.pdf`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  }

  return (
    <div className={`pdf-viewer ${className}`}>
      <div className="pdf-viewer__header">
        <div className="pdf-viewer__title-group">
          <span className="pdf-viewer__icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </span>
          <span className="pdf-viewer__title">{document.title}</span>
        </div>

        <div className="pdf-viewer__actions">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pdf-viewer__btn pdf-viewer__btn--ghost"
            aria-label="Open PDF in new tab"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15,3 21,3 21,9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open
          </a>

          {document.allowDownload && (
            <button
              onClick={handleDownload}
              className="pdf-viewer__btn pdf-viewer__btn--primary"
              aria-label={`Download ${document.title}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </button>
          )}
        </div>
      </div>

      {document.description && (
        <p className="pdf-viewer__description">{document.description}</p>
      )}

      <div className="pdf-viewer__frame-wrapper">
        {isLoading && !embedFailed && (
          <div className="pdf-viewer__loading" aria-live="polite">
            <div className="pdf-viewer__spinner" />
            <span>Loading document…</span>
          </div>
        )}

        {!embedFailed ? (
          <iframe
            src={
              document.externalEmbedUrl
                ? embedSrc
                : `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`
            }
            className="pdf-viewer__iframe"
            title={document.title || 'PDF document'}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setEmbedFailed(true)
            }}
            allow="fullscreen"
          />
        ) : (
          <div className="pdf-viewer__fallback">
            <div className="pdf-viewer__fallback-icon" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="pdf-viewer__fallback-text">
              This browser can&apos;t display the PDF inline.
            </p>
            <div className="pdf-viewer__fallback-actions">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pdf-viewer__btn pdf-viewer__btn--primary"
              >
                Open PDF
              </a>
              {document.allowDownload && (
                <button
                  onClick={handleDownload}
                  className="pdf-viewer__btn pdf-viewer__btn--ghost"
                >
                  Download PDF
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
