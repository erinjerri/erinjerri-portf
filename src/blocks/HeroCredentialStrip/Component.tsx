import type { HeroCredentialStripBlock as HeroCredentialStripBlockProps } from '@/payload-types'
import React from 'react'

const separatorMap = {
  bullet: '•',
  middot: '·',
  pipe: '|',
} as const

export const HeroCredentialStripBlock: React.FC<HeroCredentialStripBlockProps> = ({
  phrases,
  separator = 'bullet',
}) => {
  if (!phrases?.length) return null

  const marker = separatorMap[separator ?? 'bullet'] ?? '•'

  return (
    <div className="container mt-4 mb-12 md:mt-5 md:mb-16">
      <p className="text-center text-lg font-medium leading-snug tracking-tight text-white/90 md:text-xl md:leading-snug lg:text-2xl lg:leading-snug">
        {phrases.map((phrase, index) => {
          const text = phrase?.text?.trim()
          if (!text) return null

          return (
            <React.Fragment key={index}>
              {index > 0 ? <span className="mx-2 text-white/50">{marker}</span> : null}
              <span className="inline">{text}</span>
            </React.Fragment>
          )
        })}
      </p>
    </div>
  )
}
