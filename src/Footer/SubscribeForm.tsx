'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [message, setMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) return

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      const result = (await response.json()) as { ok?: boolean; error?: string }

      if (!response.ok || !result?.ok) {
        setStatus('error')
        setMessage(result?.error || 'Subscription failed. Please try again.')
        return
      }

      setStatus('success')
      setMessage('Thanks for subscribing!')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Could not reach subscription service. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          required
          className="flex-1 rounded-lg border-border bg-muted/50 text-foreground placeholder:text-muted-foreground"
        />
        <Button type="submit" size="default" className="rounded-lg shrink-0" disabled={status === 'loading'}>
          {status === 'loading' ? '...' : 'Subscribe'}
        </Button>
      </div>
      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
          {message}
        </p>
      )}
    </form>
  )
}
