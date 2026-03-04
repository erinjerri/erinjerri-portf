'use client'

import React from 'react'

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, string | number | boolean>,
    ) => void
  }
}

type ToolClickProps = {
  tool: string
  children: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
}

/**
 * Wraps a clickable element and fires `tool_click` GA event.
 * Use for tracking tool usage (e.g. calculators, generators).
 *
 * @example
 * <ToolClick tool="calculator">
 *   <button>Open Calculator</button>
 * </ToolClick>
 */
export function ToolClick({ tool, children }: ToolClickProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'tool_click', { tool })
    }
  }

  const existingOnClick = children.props.onClick

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      existingOnClick?.(e)
      handleClick()
    },
  })
}
