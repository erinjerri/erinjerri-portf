'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

type SubscribeFormProps = {
  action: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SubscribeForm({ action }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [currentUrl, setCurrentUrl] = useState('')
  const [referrer, setReferrer] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setErrorMessage('')

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      e.preventDefault()
      setStatus('error')
      setErrorMessage('Please enter a valid email.')
      return
    }

    // Let the browser submit the form directly to Substack (no CORS issues).
    setStatus('success')
    setEmail('')
  }

  useEffect(() => {
    setCurrentUrl(window.location.href)
    setReferrer(document.referrer)
  }, [])

  return (
    <form
      action={action}
      method="POST"
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="source" value="footer" />
      {currentUrl ? (
        <>
          <input type="hidden" name="first_url" value={currentUrl} />
          <input type="hidden" name="current_url" value={currentUrl} />
        </>
      ) : null}
      {referrer ? (
        <>
          <input type="hidden" name="first_referrer" value={referrer} />
          <input type="hidden" name="referrer" value={referrer} />
        </>
      ) : null}
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'submitting'}
          required
          name="email"
          className="flex-1 rounded-lg border-border bg-muted/50 text-foreground placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="default"
          className="rounded-lg shrink-0"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting...' : 'Subscribe'}
        </Button>
      </div>
      {status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Submitted to Substack. Check your email to confirm if prompted.
        </p>
      )}
      {status === 'error' && errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}
    </form>
  )
}
