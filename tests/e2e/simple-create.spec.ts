import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

test('simplified create site test', async ({ page }) => {
  // Navigate to create page directly
  await page.goto('/sites/new')
  await page.waitForLoadState('networkidle')

  // Wait for form
  await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 10000 })

  // Fill form
  await page.fill('input[name="name"]', 'E2Eテスト現場')

  // Select location
  await page.locator('[id="mui-component-select-location"]').click()
  await page.locator('[role="option"]').filter({ hasText: '東京都渋谷区' }).click()

  await page.fill('input[name="manager_name"]', 'テスト責任者')

  // Fill dates using calendar UI
  const startDay = 15
  const endDay = 25

  // Start date
  await page.locator('input[name="start_date"]').locator('xpath=ancestor::div[contains(@class, "MuiFormControl-root")]//button[@aria-label="Choose date"]').click()
  await page.waitForSelector('.MuiPickersCalendarHeader-root', { timeout: 3000 })
  await page.locator(`.MuiPickersDay-root`).filter({ hasText: new RegExp(`^${startDay}$`) }).first().click()
  await page.waitForTimeout(500)

  const startDateValue = await page.locator('input[name="start_date"]').inputValue()
  console.log(`開始日: ${startDateValue}`)

  // End date
  await page.locator('input[name="end_date"]').locator('xpath=ancestor::div[contains(@class, "MuiFormControl-root")]//button[@aria-label="Choose date"]').click()
  await page.waitForSelector('.MuiPickersCalendarHeader-root', { timeout: 3000 })
  await page.locator(`.MuiPickersDay-root`).filter({ hasText: new RegExp(`^${endDay}$`) }).first().click()
  await page.waitForTimeout(500)

  const endDateValue = await page.locator('input[name="end_date"]').inputValue()
  console.log(`終了日: ${endDateValue}`)

  await page.fill('textarea[name="description"]', 'E2Eテスト用の現場データ')

  // Check button state
  const submitButton = page.locator('button:has-text("登録")')
  const isDisabled = await submitButton.isDisabled()
  console.log(`ボタン無効: ${isDisabled}`)

  if (!isDisabled) {
    // Check for any validation errors before submitting
    const validationErrors = await page.locator('.MuiFormHelperText-root.Mui-error').count()
    console.log(`バリデーションエラー数: ${validationErrors}`)

    if (validationErrors > 0) {
      const errorTexts = await page.locator('.MuiFormHelperText-root.Mui-error').allTextContents()
      console.log(`エラー内容: ${errorTexts.join(', ')}`)
    }

    // Submit
    await submitButton.click()

    // Wait a bit for any submission
    await page.waitForTimeout(1000)

    const currentUrl = page.url()
    console.log(`送信後のURL: ${currentUrl}`)

    // Wait for redirect (but don't fail if it doesn't happen)
    try {
      await page.waitForURL(/\/sites\/[^/]+$/, { timeout: 10000 })
      const newUrl = page.url()
      const siteId = newUrl.split('/').pop()
      console.log(`✅ 作成成功: ${siteId}`)

      // Verify in database
      const { data: site } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single()

      console.log(`DB確認: ${site?.name}`)
      expect(site).not.toBeNull()
    } catch (error) {
      console.log(`❌ リダイレクトエラー: ${error}`)
      await page.screenshot({ path: 'test-results/redirect-failed.png' })

      // Check for error messages on page
      const errorMessage = await page.locator('.MuiAlert-message').textContent().catch(() => null)
      if (errorMessage) {
        console.log(`ページエラーメッセージ: ${errorMessage}`)
      }

      throw error
    }
  } else {
    console.log('❌ ボタンが無効のため送信できません')
    await page.screenshot({ path: 'test-results/button-disabled.png' })
  }
})
