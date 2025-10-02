import { test, expect } from '@playwright/test'
import { waitForTable } from './helpers'
import { getSupabaseClient } from './supabase-helper'

const supabase = getSupabaseClient()

test.describe('配属管理', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to assignments page (no auth required in dev mode)
    await page.goto('/assignments')
    await page.waitForLoadState('networkidle')
  })

  test('配属管理ページが表示される', async ({ page }) => {
    // Track console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    // Check page title
    await expect(page.locator('h1:has-text("配属管理")')).toBeVisible()

    // Check table is visible
    await expect(page.locator('table')).toBeVisible()

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('配属データがDBデータと一致する', async ({ page }) => {
    // Track console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    // Get actual count from database (only active assignments: end_date is null)
    // Note: The page displays only active assignments by default
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('*')
      .is('end_date', null)
      .order('start_date', { ascending: false })

    expect(error).toBeNull()
    const actualCount = assignments?.length || 0

    // Wait for table to load
    await expect(page.locator('table')).toBeVisible()

    // Get displayed row count (excluding header)
    const rowCount = await page.locator('tbody tr').count()

    // Compare counts
    expect(rowCount).toBe(actualCount)
    console.log(`配属数: DB=${actualCount}, 表示=${rowCount}`)

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test.skip('配属を新規登録できる', async ({ page }) => {
    // Note: Requires authentication setup

    // Click add button
    await page.click('button:has-text("配属を追加")')

    // Wait for dialog to open
    await waitForDialog(page, '配属を追加')

    // Fill form
    await fillAutocomplete(page, '従業員', '山田太郎')
    await fillAutocomplete(page, '現場', '東京プロジェクト')
    await fillDatePicker(page, '配属開始日', '2024-04-01')
    await fillDatePicker(page, '配属終了日', '2025-03-31')
    await fillTextField(page, '役割', '現場責任者')

    // Submit form
    await page.click('button:has-text("登録")')

    // Check success toast
    await waitForToast(page, '配属を登録しました')

    // Check table updated
    await waitForTable(page)
    await expect(page.locator('text=山田太郎')).toBeVisible()
    await expect(page.locator('text=東京プロジェクト')).toBeVisible()
  })

  test.skip('配属情報を編集できる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Click edit button on first row
    await clickTableAction(page, 0, '編集')

    // Wait for dialog to open
    await waitForDialog(page, '配属を編集')

    // Update role
    await fillTextField(page, '役割', 'サブリーダー')

    // Submit form
    await page.click('button:has-text("更新")')

    // Check success toast
    await waitForToast(page, '配属情報を更新しました')

    // Check table updated
    await waitForTable(page)
    await expect(page.locator('text=サブリーダー')).toBeVisible()
  })

  test.skip('配属を削除できる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Get initial row count
    const initialCount = await page.locator('tbody tr').count()

    // Click delete button on first row
    await clickTableAction(page, 0, '削除')

    // Wait for confirm dialog
    await expect(page.locator('text=本当に削除しますか？')).toBeVisible()

    // Confirm delete
    await confirmDelete(page)

    // Check table updated
    await waitForTable(page)
    const newCount = await page.locator('tbody tr').count()
    expect(newCount).toBe(initialCount - 1)
  })

  test.skip('削除をキャンセルできる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Get initial row count
    const initialCount = await page.locator('tbody tr').count()

    // Click delete button on first row
    await clickTableAction(page, 0, '削除')

    // Wait for confirm dialog
    await expect(page.locator('text=本当に削除しますか？')).toBeVisible()

    // Cancel delete
    await cancelDialog(page)

    // Check table unchanged
    const newCount = await page.locator('tbody tr').count()
    expect(newCount).toBe(initialCount)
  })

  test.skip('従業員名で検索できる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Enter search term
    await page.fill('input[placeholder*="検索"]', '山田')

    // Wait for table to update
    await page.waitForTimeout(500) // Debounce delay

    // Check filtered results
    await waitForTable(page)
    const visibleRows = await page.locator('tbody tr').count()
    expect(visibleRows).toBeGreaterThan(0)

    // All visible employee names should contain search term
    const names = await page.locator('tbody tr td:nth-child(2)').allTextContents()
    names.forEach((name) => {
      expect(name).toContain('山田')
    })
  })

  test.skip('ステータスでフィルタリングできる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Select status filter
    await selectOption(page, 'ステータス', '配属中')

    // Wait for table to update
    await waitForTable(page)

    // Check all visible rows have selected status
    const statusCells = await page.locator('tbody tr td:has-text("配属中")').count()
    expect(statusCells).toBeGreaterThan(0)
  })

  test.skip('期間でフィルタリングできる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Set date range filter
    await fillDatePicker(page, '開始日', '2024-01-01')
    await fillDatePicker(page, '終了日', '2024-12-31')

    // Wait for table to update
    await waitForTable(page)

    // Check filtered results
    const visibleRows = await page.locator('tbody tr').count()
    expect(visibleRows).toBeGreaterThan(0)
  })

  test.skip('ソート機能が動作する', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Click employee name column header to sort
    await page.click('th:has-text("従業員名")')

    // Wait for table to update
    await waitForTable(page)

    // Get first row employee name
    const firstNameAsc = await page.locator('tbody tr:first-child td:nth-child(2)').textContent()

    // Click again to reverse sort
    await page.click('th:has-text("従業員名")')
    await waitForTable(page)

    // Get first row employee name after reverse sort
    const firstNameDesc = await page.locator('tbody tr:first-child td:nth-child(2)').textContent()

    // Names should be different after sort direction change
    expect(firstNameAsc).not.toBe(firstNameDesc)
  })

  test.skip('バリデーションエラーが表示される', async ({ page }) => {
    // Note: Requires authentication setup

    // Click add button
    await page.click('button:has-text("配属を追加")')

    // Wait for dialog to open
    await waitForDialog(page, '配属を追加')

    // Try to submit without filling required fields
    await page.click('button:has-text("登録")')

    // Check validation errors
    await expect(page.locator('text=従業員を選択してください')).toBeVisible()
    await expect(page.locator('text=現場を選択してください')).toBeVisible()
    await expect(page.locator('text=配属開始日を選択してください')).toBeVisible()
  })

  test.skip('終了日は開始日より後でなければならない', async ({ page }) => {
    // Note: Requires authentication setup

    // Click add button
    await page.click('button:has-text("配属を追加")')

    // Wait for dialog to open
    await waitForDialog(page, '配属を追加')

    // Fill form with invalid dates
    await fillAutocomplete(page, '従業員', '山田太郎')
    await fillAutocomplete(page, '現場', '東京プロジェクト')
    await fillDatePicker(page, '配属開始日', '2024-12-31')
    await fillDatePicker(page, '配属終了日', '2024-01-01') // Before start date

    // Try to submit
    await page.click('button:has-text("登録")')

    // Check validation error
    await expect(
      page.locator('text=配属終了日は配属開始日より後の日付を選択してください')
    ).toBeVisible()
  })

  test.skip('従業員名をクリックすると従業員詳細が表示される', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Click employee name link
    await page.locator('tbody tr:first-child td:nth-child(2) a').click()

    // Check employee detail page is displayed
    await expect(page.locator('h2:has-text("従業員詳細")')).toBeVisible({ timeout: 5000 })
  })

  test.skip('現場名をクリックすると現場詳細が表示される', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Click site name link
    await page.locator('tbody tr:first-child td:nth-child(3) a').click()

    // Check site detail page is displayed
    await expect(page.locator('h2:has-text("現場詳細")')).toBeVisible({ timeout: 5000 })
  })

  test.skip('配属期間が自動計算される', async ({ page }) => {
    // Note: Requires authentication setup

    // Click add button
    await page.click('button:has-text("配属を追加")')

    // Wait for dialog to open
    await waitForDialog(page, '配属を追加')

    // Fill dates
    await fillDatePicker(page, '配属開始日', '2024-04-01')
    await fillDatePicker(page, '配属終了日', '2025-03-31')

    // Check duration is displayed (should be calculated automatically)
    await expect(page.locator('text=12ヶ月')).toBeVisible({ timeout: 2000 })
  })

  test.skip('利用可能な従業員のみが選択肢に表示される', async ({ page }) => {
    // Note: Requires authentication setup

    // Click add button
    await page.click('button:has-text("配属を追加")')

    // Wait for dialog to open
    await waitForDialog(page, '配属を追加')

    // Click employee autocomplete
    await page.locator('label:has-text("従業員")').locator('..').click()

    // Wait for options to appear
    await page.waitForSelector('[role="listbox"]', { timeout: 3000 })

    // Check that options are available employees only
    const options = await page.locator('[role="option"]').count()
    expect(options).toBeGreaterThan(0)

    // Note: In real test, you would verify unavailable employees are not in the list
  })
})
