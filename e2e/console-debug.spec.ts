import { test, expect } from '@playwright/test'

test('Check console errors on sites edit page', async ({ page }) => {
  const consoleMessages: string[] = []
  const consoleErrors: string[] = []
  const pageErrors: string[] = []

  // Capture all console messages
  page.on('console', (msg) => {
    const text = msg.text()
    consoleMessages.push(`[${msg.type()}] ${text}`)
    if (msg.type() === 'error') {
      consoleErrors.push(text)
    }
  })

  // Capture page errors
  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  // Navigate to sites page
  await page.goto('/sites')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  console.log('\n=== Sites List Page ===')
  console.log('Console messages:', consoleMessages.length)
  console.log('Console errors:', consoleErrors.length)
  console.log('Page errors:', pageErrors.length)

  if (consoleErrors.length > 0) {
    console.log('\nConsole Errors:')
    consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`))
  }

  if (pageErrors.length > 0) {
    console.log('\nPage Errors:')
    pageErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`))
  }

  // Clear arrays for edit page
  consoleMessages.length = 0
  consoleErrors.length = 0
  pageErrors.length = 0

  // Get first site and navigate to edit page
  const firstRow = page.locator('tbody tr').first()
  const siteName = await firstRow.locator('td').nth(0).textContent()
  const editButton = firstRow.locator('button[aria-label*="編集"]')
  await editButton.click()

  // Wait for edit page
  await page.waitForURL(/\/sites\/[^/]+\/edit/, { timeout: 10000 })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  console.log('\n=== Sites Edit Page ===')
  console.log('Site name:', siteName)
  console.log('Console messages:', consoleMessages.length)
  console.log('Console errors:', consoleErrors.length)
  console.log('Page errors:', pageErrors.length)

  if (consoleErrors.length > 0) {
    console.log('\nConsole Errors:')
    consoleErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`))
  }

  if (pageErrors.length > 0) {
    console.log('\nPage Errors:')
    pageErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`))
  }

  // Take screenshot
  await page.screenshot({ path: 'test-results/sites-edit-debug.png', fullPage: true })

  // Check if form is visible
  const nameInput = await page.locator('input[name="name"]').isVisible()
  console.log('\nForm visible:', nameInput)

  if (!nameInput) {
    const bodyText = await page.locator('body').textContent()
    console.log('\nPage body text:', bodyText?.substring(0, 500))
  }
})
