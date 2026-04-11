'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, string | number | boolean>,
    ) => void
  }
}

type SubscribeFormProps = {
  /** Substack embed URL — used for iframe fallback when useApiForm is false */
  action: string
  /** Use API form (tracks newsletter_signup via gtag) vs iframe embed */
  useApiForm?: boolean
}

export function SubscribeForm({ action, useApiForm = true }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          currentUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        }),
      })

      const data = (await res.json()) as { ok?: boolean; error?: string }

      if (data.ok) {
        setStatus('success')
        setEmail('')
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'newsletter_signup')
        }
      } else {
        setStatus('error')
        setErrorMessage(data.error ?? 'Subscription failed. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  if (!useApiForm) {
    return (
      <div className="flex flex-col gap-3">
        <iframe
          src={action}
          title="Substack subscribe"
          className="w-full min-h-[140px] rounded-lg border border-border bg-transparent"
          scrolling="no"
        />
        <noscript>
          <form action="https://erinjerri.substack.com/subscribe" method="GET" className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              required
              name="email"
              className="flex-1 rounded-lg border-border bg-muted/50 text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" size="default" className="shrink-0">
              Subscribe
            </Button>
          </form>
        </noscript>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {status === 'success' ? (
        <p className="text-sm text-muted-foreground">Thanks for subscribing!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="flex-1 rounded-lg border-border bg-muted/50 text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" size="default" className="shrink-0" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
          </Button>
        </form>
      )}
      {status === 'error' && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  )
}
