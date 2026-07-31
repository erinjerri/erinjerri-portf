import { expect, test } from '@playwright/test'

test.describe('Payload admin hydration', () => {
  test('tolerates browser-added theme attributes on the login page', async ({ page }) => {
    await page.addInitScript(() => {
      const applyBrowserThemeAttribute = () => {
        document.documentElement?.setAttribute('data-fabric-scheme', 'dark')
      }

      new MutationObserver(applyBrowserThemeAttribute).observe(document, {
        childList: true,
        subtree: true,
      })
      applyBrowserThemeAttribute()
    })

    const hydrationErrors: string[] = []
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        /hydrat|server rendered html|didn.t match/i.test(message.text())
      ) {
        hydrationErrors.push(message.text())
      }
    })

    await page.goto('http://localhost:3000/admin/login')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('html')).toHaveAttribute('data-fabric-scheme', 'dark')
    expect(hydrationErrors).toEqual([])
  })
})
