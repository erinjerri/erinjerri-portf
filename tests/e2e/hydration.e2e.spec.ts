import { test, expect } from '@playwright/test'

test.describe('Hydration', () => {
  test('does not log hydration mismatch on homepage', async ({ page }) => {
    const hydrationErrors: string[] = []

    page.on('console', (msg) => {
      // React/Next hydration issues are typically logged as console.error.
      if (msg.type() !== 'error') return
      const text = msg.text()
      if (text.includes('Hydration failed') || text.includes('hydration mismatch')) {
        hydrationErrors.push(text)
      }
    })

    page.on('pageerror', (err) => {
      const text = String(err?.message || err)
      if (text.includes('Hydration failed') || text.includes('hydration mismatch')) {
        hydrationErrors.push(text)
      }
    })

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })

    // Give React a moment to finish hydration and settle.
    await page.waitForTimeout(1500)

    expect(hydrationErrors).toEqual([])
  })
})

