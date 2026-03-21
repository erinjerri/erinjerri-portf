import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto('https://www.linkedin.com/login')

  await page.fill('#username', process.env.LINKEDIN_USER!)
  await page.fill('#password', process.env.LINKEDIN_PASS!)

  await page.click('button[type="submit"]')

  await page.waitForTimeout(5000)

  // go to your profile
  await page.goto('https://www.linkedin.com/in/erinjerri/')

  await page.waitForTimeout(3000)

  // example follower selector
  const followers = await page.locator('text=followers').first().textContent()

  console.log('followers:', followers)

  // send to payload CMS

  await fetch('https://yourdomain.com/api/linkedinMetrics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PAYLOAD_TOKEN}`,
    },
    body: JSON.stringify({
      followers,
      date: new Date(),
    }),
  })

  await browser.close()
}

run()
