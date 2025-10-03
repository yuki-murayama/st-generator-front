import { test, expect } from '@playwright/test'

test.describe('DatePicker Debug', () => {
  test('inspect date picker structure', async ({ page }) => {
    // Navigate to sites/new page
    await page.goto('/sites/new')
    await page.waitForLoadState('networkidle')

    // Wait for form to be visible
    await page.waitForSelector('input[name="name"]', { timeout: 5000 })

    // Get all calendar buttons
    const allCalendarButtons = await page.locator('button[aria-label*="date"]').count()
    console.log(`Found ${allCalendarButtons} calendar buttons`)

    // Try to find by different selectors
    const byChooseDate = await page.locator('button[aria-label="Choose date"]').count()
    console.log(`Buttons with aria-label="Choose date": ${byChooseDate}`)

    // Find all buttons near date inputs
    const startDateParent = page.locator('input[name="start_date"]').locator('..')
    const startButtons = await startDateParent.locator('button').count()
    console.log(`Buttons near start_date input: ${startButtons}`)

    const endDateParent = page.locator('input[name="end_date"]').locator('..')
    const endButtons = await endDateParent.locator('button').count()
    console.log(`Buttons near end_date input: ${endButtons}`)

    // Try finding buttons in the input adornment
    const startAdornment = page.locator('input[name="start_date"]').locator('xpath=../following-sibling::*[1]')
    const startAdornmentButtons = await startAdornment.locator('button').count()
    console.log(`Buttons in start date adornment: ${startAdornmentButtons}`)

    // Screenshot
    await page.screenshot({ path: 'test-results/datepicker-structure.png' })
  })
})
