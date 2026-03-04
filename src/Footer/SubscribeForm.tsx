'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

type SubscribeFormProps = {
  isConfigured: boolean
}

export function SubscribeForm({ isConfigured }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isConfigured) {
      setStatus('error')
      setErrorMessage('Subscribe is not configured yet.')
      return
    }

    if (!email.trim()) {
      setStatus('error')
      setErrorMessage('Please enter a valid email.')
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = (await response.json()) as { ok?: boolean; error?: string }

      if (!response.ok || !data?.ok) {
        setStatus('error')
        setErrorMessage(data?.error || 'Subscription failed. Please try again.')
        return
      }

      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
      setErrorMessage('Subscription failed. Please try again.')
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
          disabled={!isConfigured || status === 'submitting'}
          required
          className="flex-1 rounded-lg border-border bg-muted/50 text-foreground placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="default"
          className="rounded-lg shrink-0"
          disabled={!isConfigured || status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting...' : 'Subscribe'}
        </Button>
      </div>
      {!isConfigured && (
        <p className="text-sm text-destructive">Subscribe is not configured yet.</p>
      )}
      {status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">
          You are subscribed. Check your email to confirm if prompted.
        </p>
      )}
      {status === 'error' && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </form>
  )
}
