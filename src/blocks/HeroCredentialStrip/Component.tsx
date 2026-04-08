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
    <div className="container mt-3 mb-8 md:mt-4 md:mb-10">
      <p className="text-center text-[0.9rem] leading-relaxed text-white/70 md:text-[0.95rem]">
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
