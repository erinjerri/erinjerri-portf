import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'

type SubscribeFormProps = {
  action: string
}

export function SubscribeForm({ action }: SubscribeFormProps) {
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
          <Button type="submit" size="default" className="rounded-lg shrink-0">
            Subscribe
          </Button>
        </form>
      </noscript>
    </div>
  )
}
