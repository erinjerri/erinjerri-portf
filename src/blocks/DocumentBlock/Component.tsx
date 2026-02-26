import React from 'react'
import { PdfViewer } from '@/components/PdfViewer/PdfViewer'

type DocumentBlockProps = {
  document?: {
    id?: string
    url?: string | null
    filename?: string | null
    title?: string | null
    allowDownload?: boolean | null
    description?: string | null
    externalEmbedUrl?: string | null
  } | string
  disableInnerContainer?: boolean
}

export const DocumentBlockComponent: React.FC<DocumentBlockProps> = ({
  document: doc,
}) => {
  if (!doc || typeof doc !== 'object') return null

  return (
    <div className="container my-8">
      <PdfViewer document={doc} />
    </div>
  )
}
