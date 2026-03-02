'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'

type FormStatus = 'idle' | 'submitted'

type SubscribeFormProps = {
  substackFormAction: string | null
}

export function SubscribeForm({ substackFormAction }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!substackFormAction) {
      e.preventDefault()
      return
    }
    setStatus('submitted')
  }

  return (
    <form
      onSubmit={handleSubmit}
      action={substackFormAction ?? undefined}
      method="POST"
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-3"
    >
      <div className="flex gap-2">
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!substackFormAction}
          required
          className="flex-1 rounded-lg border-border bg-muted/50 text-foreground placeholder:text-muted-foreground"
        />
        <input type="hidden" name="source" value="subscribe_page" />
        <Button type="submit" size="default" className="rounded-lg shrink-0" disabled={!substackFormAction}>
          Subscribe
        </Button>
      </div>
      {!substackFormAction && (
        <p className="text-sm text-destructive">Subscribe is not configured yet.</p>
      )}
      {status === 'submitted' && substackFormAction && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Opened Substack signup in a new tab. Complete your subscription there.
        </p>
      )}
    </form>
  )
}
