import type { StatsBlockBlock as StatsBlockBlockProps } from '@/payload-types'
import React from 'react'

const colorMap = {
  mint: 'text-[#9ff0bd]',
  teal: 'text-[#78e7df]',
  pink: 'text-[#f3b0d2]',
  white: 'text-white',
} as const

export const StatsBlockBlock: React.FC<StatsBlockBlockProps> = ({ eyebrow, items }) => {
  const statItems = items?.filter((item) => item?.value?.trim() || item?.label?.trim()) ?? []

  if (!statItems.length) return null

  return (
    <section className="rounded-[8px] border border-white/10 bg-[#0b0d11] px-8 py-10 text-white shadow-[0_28px_80px_-48px_rgba(0,0,0,0.8)] md:px-12 md:py-12">
      {eyebrow?.trim() ? (
        <p className="mb-8 text-center text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/28">
          {eyebrow.trim()}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statItems.map((item, index) => {
          const color = colorMap[item.color ?? 'mint'] ?? colorMap.mint

          return (
            <div
              className="rounded-[8px] border border-white/10 bg-white/[0.02] px-6 py-7 text-center"
              key={item.id ?? index}
            >
              <div className={`font-title text-[3.25rem] font-semibold leading-none ${color} md:text-[3.9rem]`}>
                {item.value?.trim()}
              </div>
              <div className="mx-auto mt-4 max-w-[12rem] text-[0.78rem] font-semibold uppercase leading-5 tracking-[0.15em] text-white/34">
                {item.label?.trim()}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
