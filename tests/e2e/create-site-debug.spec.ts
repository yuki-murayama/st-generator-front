import { test } from '@playwright/test'

test('debug create site form', async ({ page }) => {
  // Navigate to create page
  await page.goto('/sites/new')
  await page.waitForLoadState('networkidle')

  // Wait for form
  await page.waitForSelector('input[name="name"]', { timeout: 5000 })

  console.log('=== Form Initial State ===')

  // Fill basic fields
  await page.fill('input[name="name"]', 'E2Eテスト現場')
  console.log('✓ Filled name field')

  // Location selector
  await page.locator('[id="mui-component-select-location"]').click()
  await page.locator('[role="option"]').filter({ hasText: '東京都渋谷区' }).click()
  console.log('✓ Selected location')

  await page.fill('input[name="manager_name"]', 'テスト責任者')
  console.log('✓ Filled manager name')

  // Check button state before dates
  const buttonBeforeDates = await page.locator('button:has-text("登録")')
  const isDisabledBefore = await buttonBeforeDates.isDisabled()
  console.log(`Button disabled before dates: ${isDisabledBefore}`)

  // Fill dates using calendar UI
  const startDay = 15
  const endDay = 25

  // Start date
  console.log('Opening start date calendar...')
  await page.locator('input[name="start_date"]').locator('xpath=ancestor::div[contains(@class, "MuiFormControl-root")]//button[@aria-label="Choose date"]').click()
  await page.waitForSelector('.MuiPickersCalendarHeader-root', { timeout: 3000 })
  console.log('Calendar opened')

  await page.locator(`.MuiPickersDay-root`).filter({ hasText: new RegExp(`^${startDay}$`) }).first().click()
  console.log(`✓ Clicked day ${startDay}`)

  await page.waitForTimeout(500)

  // Check start date input value
  const startDateValue = await page.locator('input[name="start_date"]').inputValue()
  console.log(`Start date value: "${startDateValue}"`)

  // End date
  console.log('Opening end date calendar...')
  await page.locator('input[name="end_date"]').locator('xpath=ancestor::div[contains(@class, "MuiFormControl-root")]//button[@aria-label="Choose date"]').click()
  await page.waitForSelector('.MuiPickersCalendarHeader-root', { timeout: 3000 })

  await page.locator(`.MuiPickersDay-root`).filter({ hasText: new RegExp(`^${endDay}$`) }).first().click()
  console.log(`✓ Clicked day ${endDay}`)

  await page.waitForTimeout(500)

  // Check end date input value
  const endDateValue = await page.locator('input[name="end_date"]').inputValue()
  console.log(`End date value: "${endDateValue}"`)

  // Fill description
  await page.fill('textarea[name="description"]', 'E2Eテスト用の現場データ')
  console.log('✓ Filled description')

  // Check final button state
  const buttonAfterAll = await page.locator('button:has-text("登録")')
  const isDisabledAfter = await buttonAfterAll.isDisabled()
  console.log(`Button disabled after all fields: ${isDisabledAfter}`)

  // Check form validity
  const formIsValid = await page.evaluate(() => {
    const form = document.querySelector('form')
    return form ? form.checkValidity() : 'no form found'
  })
  console.log(`Form validity: ${formIsValid}`)

  // Screenshot
  await page.screenshot({ path: 'test-results/create-debug.png' })
  console.log('Screenshot saved')
})
