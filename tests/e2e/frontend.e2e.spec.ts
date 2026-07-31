import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Erin Jerri/)

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText('Erin Jerri')
  })

  test('renders the selected Speaker Bio Kit headshot at a visible size', async ({ page }) => {
    await page.goto('http://localhost:3000/about')

    const preview = page.getByTestId('speaker-headshot-preview')
    const image = preview.locator('img')

    await preview.scrollIntoViewIfNeeded()
    await expect(preview).toBeVisible()
    await expect(image).toBeVisible()
    const options = page.getByRole('tablist', { name: 'Headshot options' }).getByRole('tab')

    for (let index = 0; index < (await options.count()); index += 1) {
      await options.nth(index).click()
      await expect
        .poll(async () => {
          const dimensions = await image.evaluate((element) => ({
            height: element.getBoundingClientRect().height,
            naturalWidth: (element as HTMLImageElement).naturalWidth,
            width: element.getBoundingClientRect().width,
          }))

          return dimensions.naturalWidth > 0 && dimensions.width > 0 && dimensions.height > 0
        })
        .toBe(true)
    }
  })
})
