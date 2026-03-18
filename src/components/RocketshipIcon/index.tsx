import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * White line-art rocketship icon for hire block overlay.
 * Uses currentColor so it inherits white from parent text-white.
 */
export const RocketshipIcon: React.FC<{
  className?: string
  size?: number
}> = ({ className, size = 32 }) => {
  return (
    <svg
      aria-hidden
      className={cn('shrink-0', className)}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main body: pointed nose, fuselage, base */}
      <path d="M12 2l-2 5h4l-2-5z" />
      <path d="M10 7h4v9H10z" />
      <path d="M10 10h4" />
      {/* Windows */}
      <circle cx="14" cy="8.5" r="0.75" fill="currentColor" />
      <circle cx="14" cy="10.5" r="0.6" fill="currentColor" />
      {/* Fins */}
      <path d="M10 16l-1.5 4 1.5-1 1.5 1-1.5-4z" />
      <path d="M14 16l1.5 4-1.5-1-1.5 1 1.5-4z" />
      {/* Thruster + flame */}
      <path d="M11.5 18h1" />
      <path d="M10 21l2-2 2 2" />
    </svg>
  )
}
