import { Page, expect } from '@playwright/test'

/**
 * Test helper functions for E2E tests
 */

/**
 * Login helper - performs login flow
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button:has-text("ログイン")')

  // Wait for navigation to complete
  await page.waitForURL('/', { timeout: 10000 })
}

/**
 * Logout helper - performs logout
 */
export async function logout(page: Page) {
  // Click profile menu
  await page.click('[aria-label="アカウント設定"]')

  // Click logout button
  await page.click('text=ログアウト')

  // Wait for redirect to login page
  await page.waitForURL('/login', { timeout: 10000 })
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, message: string) {
  await expect(page.locator('.MuiSnackbar-root').filter({ hasText: message })).toBeVisible({
    timeout: 5000,
  })
}

/**
 * Fill MUI TextField
 */
export async function fillTextField(page: Page, label: string, value: string) {
  const input = page.locator(`label:has-text("${label}")`).locator('..').locator('input')
  await input.fill(value)
}

/**
 * Fill MUI Autocomplete
 */
export async function fillAutocomplete(page: Page, label: string, value: string) {
  // Click the autocomplete input
  const autocomplete = page.locator(`label:has-text("${label}")`).locator('..')
  await autocomplete.click()

  // Type to filter options
  await autocomplete.locator('input').fill(value)

  // Wait for options to appear
  await page.waitForSelector('[role="listbox"]', { timeout: 3000 })

  // Click the matching option
  await page.click(`[role="option"]:has-text("${value}")`)
}

/**
 * Select MUI Select option
 */
export async function selectOption(page: Page, label: string, value: string) {
  // Click the select
  await page.click(`label:has-text("${label}")`)

  // Wait for menu to open
  await page.waitForSelector('[role="listbox"]', { timeout: 3000 })

  // Click the option
  await page.click(`[role="option"]:has-text("${value}")`)
}

/**
 * Fill MUI DatePicker
 */
export async function fillDatePicker(page: Page, label: string, date: string) {
  const input = page.locator(`label:has-text("${label}")`).locator('..').locator('input')
  await input.fill(date)
  await input.press('Enter')
}

/**
 * Wait for table to load
 */
export async function waitForTable(page: Page) {
  // Wait for table to be visible
  await expect(page.locator('table')).toBeVisible({ timeout: 10000 })

  // Wait for loading state to disappear
  await expect(page.locator('text=読み込み中')).not.toBeVisible({ timeout: 10000 })
}

/**
 * Get table row count
 */
export async function getTableRowCount(page: Page): Promise<number> {
  const rows = await page.locator('tbody tr').count()
  return rows
}

/**
 * Click table action button
 */
export async function clickTableAction(page: Page, rowIndex: number, action: '編集' | '削除' | '詳細') {
  const row = page.locator('tbody tr').nth(rowIndex)
  await row.locator(`button[aria-label="${action}"]`).click()
}

/**
 * Confirm delete dialog
 */
export async function confirmDelete(page: Page) {
  await page.click('button:has-text("削除")')
  await waitForToast(page, '削除しました')
}

/**
 * Cancel dialog
 */
export async function cancelDialog(page: Page) {
  await page.click('button:has-text("キャンセル")')
}

/**
 * Wait for dialog to open
 */
export async function waitForDialog(page: Page, title: string) {
  await expect(page.locator('[role="dialog"]').filter({ hasText: title })).toBeVisible({
    timeout: 5000,
  })
}

/**
 * Close dialog
 */
export async function closeDialog(page: Page) {
  await page.click('[role="dialog"] button[aria-label="close"]')
}

/**
 * Get console errors from page
 */
export async function getConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  page.on('pageerror', (error) => {
    errors.push(error.message)
  })

  return errors
}

/**
 * Check for console errors and fail test if any exist
 */
export async function expectNoConsoleErrors(page: Page, errors: string[]) {
  if (errors.length > 0) {
    console.error('Console errors detected:', errors)
    throw new Error(`Console errors found: ${errors.join(', ')}`)
  }
}
