import { test, expect } from '@playwright/test'
import { waitForTable } from './helpers'
import { getSupabaseClient } from './supabase-helper'

const supabase = getSupabaseClient()

test.describe('従業員管理', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to employees page (no auth required in dev mode)
    await page.goto('/employees')
    await page.waitForLoadState('networkidle')
  })

  test('従業員一覧ページが表示される', async ({ page }) => {
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
    await expect(page.locator('h1:has-text("従業員管理")')).toBeVisible()

    // Check table is visible
    await expect(page.locator('table')).toBeVisible()

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('従業員データがDBデータと一致する', async ({ page }) => {
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

    // Get actual count from database
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })

    expect(error).toBeNull()
    const actualCount = employees?.length || 0

    // Wait for table to load
    await expect(page.locator('table')).toBeVisible()

    // Get displayed row count (excluding header)
    const rowCount = await page.locator('tbody tr').count()

    // Compare counts
    expect(rowCount).toBe(actualCount)
    console.log(`従業員数: DB=${actualCount}, 表示=${rowCount}`)

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test.skip('従業員を新規登録できる', async ({ page }) => {
    // Note: Requires authentication setup

    // Click add button
    await page.click('button:has-text("従業員を追加")')

    // Wait for dialog to open
    await waitForDialog(page, '従業員を追加')

    // Fill form
    await fillTextField(page, '従業員番号', 'EMP001')
    await fillTextField(page, '氏名', '山田太郎')
    await fillTextField(page, 'フリガナ', 'ヤマダタロウ')
    await fillDatePicker(page, '生年月日', '1990-01-01')
    await selectOption(page, '性別', '男性')
    await fillTextField(page, 'メールアドレス', 'yamada@example.com')
    await fillTextField(page, '電話番号', '090-1234-5678')
    await fillTextField(page, '住所', '東京都渋谷区')
    await selectOption(page, '部署', '開発部')
    await fillTextField(page, '役職', 'エンジニア')
    await fillDatePicker(page, '入社日', '2024-04-01')

    // Submit form
    await page.click('button:has-text("登録")')

    // Check success toast
    await waitForToast(page, '従業員を登録しました')

    // Check table updated
    await waitForTable(page)
    await expect(page.locator('text=山田太郎')).toBeVisible()
  })

  test.skip('従業員情報を編集できる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Click edit button on first row
    await clickTableAction(page, 0, '編集')

    // Wait for dialog to open
    await waitForDialog(page, '従業員を編集')

    // Update name
    await fillTextField(page, '氏名', '山田次郎')

    // Submit form
    await page.click('button:has-text("更新")')

    // Check success toast
    await waitForToast(page, '従業員情報を更新しました')

    // Check table updated
    await waitForTable(page)
    await expect(page.locator('text=山田次郎')).toBeVisible()
  })

  test.skip('従業員を削除できる', async ({ page }) => {
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

  test.skip('従業員を検索できる', async ({ page }) => {
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

    // All visible names should contain search term
    const names = await page.locator('tbody tr td:nth-child(2)').allTextContents()
    names.forEach((name) => {
      expect(name).toContain('山田')
    })
  })

  test.skip('ソート機能が動作する', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Click name column header to sort
    await page.click('th:has-text("氏名")')

    // Wait for table to update
    await waitForTable(page)

    // Get first row name
    const firstNameAsc = await page.locator('tbody tr:first-child td:nth-child(2)').textContent()

    // Click again to reverse sort
    await page.click('th:has-text("氏名")')
    await waitForTable(page)

    // Get first row name after reverse sort
    const firstNameDesc = await page.locator('tbody tr:first-child td:nth-child(2)').textContent()

    // Names should be different after sort direction change
    expect(firstNameAsc).not.toBe(firstNameDesc)
  })

  test.skip('ページネーションが動作する', async ({ page }) => {
    // Note: Requires authentication setup and sufficient data (>25 rows)

    // Wait for table to load
    await waitForTable(page)

    // Get first row on page 1
    const firstRowPage1 = await page.locator('tbody tr:first-child td:nth-child(2)').textContent()

    // Click next page button
    await page.click('button[aria-label*="next"]')

    // Wait for table to update
    await waitForTable(page)

    // Get first row on page 2
    const firstRowPage2 = await page.locator('tbody tr:first-child td:nth-child(2)').textContent()

    // Rows should be different on different pages
    expect(firstRowPage1).not.toBe(firstRowPage2)
  })

  test.skip('バリデーションエラーが表示される', async ({ page }) => {
    // Note: Requires authentication setup

    // Click add button
    await page.click('button:has-text("従業員を追加")')

    // Wait for dialog to open
    await waitForDialog(page, '従業員を追加')

    // Try to submit without filling required fields
    await page.click('button:has-text("登録")')

    // Check validation errors
    await expect(page.locator('text=従業員番号を入力してください')).toBeVisible()
    await expect(page.locator('text=氏名を入力してください')).toBeVisible()
  })

  test.skip('従業員詳細を表示できる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Click detail button on first row
    await clickTableAction(page, 0, '詳細')

    // Check detail page or dialog is displayed
    await expect(page.locator('h2:has-text("従業員詳細")')).toBeVisible({ timeout: 5000 })
  })
})
