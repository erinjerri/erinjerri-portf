import React from 'react'

export function SubstackIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Substack</title>
      <path
        d="M4 5h16v2H4V5Zm0 4h16v2H4V9Zm0 4 8 5 8-5v6H4v-6Z"
        fill="currentColor"
      />
    </svg>
  )
}
