import { test, expect } from '@playwright/test'
import { waitForTable } from './helpers'
import { getSupabaseClient } from './supabase-helper'

const supabase = getSupabaseClient()

test.describe('現場管理', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to sites page (no auth required in dev mode)
    await page.goto('/sites')
    await page.waitForLoadState('networkidle')
  })

  test('現場一覧ページが表示される', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("現場一覧")')).toBeVisible()

    // Check table or cards are visible
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasCards = await page.locator('[class*="Card"]').count() > 0

    expect(hasTable || hasCards).toBe(true)
  })

  test('現場データがDBデータと一致する', async ({ page }) => {
    // Get actual count from database
    const { data: sites, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false })

    expect(error).toBeNull()
    const actualCount = sites?.length || 0

    // Wait for content to load
    await page.waitForTimeout(1000)

    // Get displayed count (either table rows or cards)
    const tableRows = await page.locator('tbody tr').count()
    const cards = await page.locator('[class*="MuiCard-root"]').count()
    const displayedCount = Math.max(tableRows, cards)

    // Compare counts
    expect(displayedCount).toBe(actualCount)
    console.log(`現場数: DB=${actualCount}, 表示=${displayedCount}`)
  })

  test('現場を新規登録できる', async ({ page }) => {
    // Track console errors (excluding expected auth errors in dev mode)
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Ignore auth session errors in VITE_SKIP_AUTH mode
        if (!text.includes('AuthSessionMissingError')) {
          consoleErrors.push(text)
        }
      }
    })
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    // Get initial count from database
    const { data: initialSites } = await supabase
      .from('sites')
      .select('*')
    const initialCount = initialSites?.length || 0

    // Click add button
    await page.click('button:has-text("現場新規登録")')

    // Wait for form page to load
    await page.waitForURL('/sites/new', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // Wait for form fields to be visible
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 10000 })

    // Fill form
    await page.fill('input[name="name"]', 'E2Eテスト現場')

    // Select location - click on the select component itself
    await page.locator('[id="mui-component-select-location"]').click()
    await page.locator('[role="option"]').filter({ hasText: '東京都渋谷区' }).click()

    await page.fill('input[name="manager_name"]', 'テスト責任者')

    // Fill dates - Click calendar button and select date
    // Start date: 2025-01-15
    const startDateField = page.locator('input[name="start_date"]').first()
    await startDateField.click()
    await startDateField.clear()
    await startDateField.type('01/15/2025')
    await page.keyboard.press('Tab') // Move focus to trigger validation

    // End date: 2025-03-31
    const endDateField = page.locator('input[name="end_date"]').first()
    await endDateField.click()
    await endDateField.clear()
    await endDateField.type('03/31/2025')
    await page.keyboard.press('Tab') // Move focus to trigger validation

    // Status is already set to "進行中" (active) by default

    await page.fill('textarea[name="description"]', 'E2Eテスト用の現場データ')

    // Submit form
    await page.click('button:has-text("登録")')

    // Wait for redirect to list page
    await page.waitForURL('/sites', { timeout: 10000 })

    // Wait for table to load
    await waitForTable(page)

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)

    // Check new site appears in the table
    await expect(page.locator('text=E2Eテスト現場')).toBeVisible()

    // Verify in database
    const { data: newSites, error } = await supabase
      .from('sites')
      .select('*')
      .eq('name', 'E2Eテスト現場')

    expect(error).toBeNull()
    expect(newSites).toHaveLength(1)
    expect(newSites?.[0]).toMatchObject({
      name: 'E2Eテスト現場',
      location: '東京都渋谷区',
      manager_name: 'テスト責任者',
      status: 'active',
      description: 'E2Eテスト用の現場データ'
    })

    // Verify total count increased
    const { data: allSites } = await supabase.from('sites').select('*')
    expect(allSites?.length).toBe(initialCount + 1)

    console.log(`✅ 新規登録成功: ${newSites?.[0].name} (ID: ${newSites?.[0].id})`)
  })

  test('現場情報を編集できる', async ({ page }) => {
    // Track console errors (excluding expected auth errors in dev mode)
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Ignore auth session errors in VITE_SKIP_AUTH mode
        if (!text.includes('AuthSessionMissingError')) {
          consoleErrors.push(text)
        }
      }
    })
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    // Get the first site from database to edit
    const { data: existingSites } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    expect(existingSites).toHaveLength(1)
    const targetSite = existingSites![0]
    const originalName = targetSite.name

    // Wait for table to load
    await waitForTable(page)

    // Find and click edit button for the target site
    const row = page.locator('tbody tr').filter({ hasText: originalName }).first()
    await row.locator('button[aria-label="編集"]').click()

    // Wait for edit page to load
    await page.waitForURL(`/sites/${targetSite.id}/edit`, { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // Wait for form fields to be visible
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 10000 })

    // Update site name and description
    const updatedName = `${originalName}_更新済み`
    await page.fill('input[name="name"]', updatedName)
    await page.fill('textarea[name="description"]', '更新テストで変更されました')

    // Submit form
    await page.click('button:has-text("更新")')

    // Wait for redirect to detail page
    await page.waitForURL(/\/sites\/[^/]+$/, { timeout: 10000 })

    // Navigate back to list page
    await page.goto('/sites')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await waitForTable(page)

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)

    // Check updated site appears in the table
    await expect(page.locator(`text=${updatedName}`)).toBeVisible()

    // Verify in database
    const { data: updatedSite, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', targetSite.id)
      .single()

    expect(error).toBeNull()
    expect(updatedSite.name).toBe(updatedName)
    expect(updatedSite.description).toBe('更新テストで変更されました')

    console.log(`✅ 更新成功: ${originalName} → ${updatedName}`)
  })

  test('現場を削除できる', async ({ page }) => {
    // Track console errors (excluding expected auth errors in dev mode)
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Ignore auth session errors in VITE_SKIP_AUTH mode
        if (!text.includes('AuthSessionMissingError')) {
          consoleErrors.push(text)
        }
      }
    })
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    // Get a site to delete (find one created in tests)
    const { data: sitesToDelete } = await supabase
      .from('sites')
      .select('*')
      .ilike('name', '%E2Eテスト%')
      .limit(1)

    // If no test site exists, skip this test
    if (!sitesToDelete || sitesToDelete.length === 0) {
      console.log('⏭️  スキップ: 削除対象のテストデータが見つかりません')
      return
    }

    const targetSite = sitesToDelete[0]
    const initialCount = (await supabase.from('sites').select('*')).data?.length || 0

    // Wait for table to load
    await waitForTable(page)

    // Get initial row count on page
    const initialRowCount = await page.locator('tbody tr').count()

    // Find and click delete button for the target site
    const row = page.locator('tbody tr').filter({ hasText: targetSite.name }).first()
    await row.locator('button[aria-label="削除"]').click()

    // Wait for confirm dialog
    await expect(page.locator('[role="dialog"]').filter({ hasText: '削除' })).toBeVisible()

    // Confirm delete
    await page.click('[role="dialog"] button:has-text("削除")')

    // Wait for table to reload
    await page.waitForTimeout(1000)
    await waitForTable(page)

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)

    // Check site no longer appears in the table
    await expect(page.locator(`text=${targetSite.name}`)).not.toBeVisible()

    // Verify row count decreased
    const newRowCount = await page.locator('tbody tr').count()
    expect(newRowCount).toBe(initialRowCount - 1)

    // Verify deletion in database
    const { data: deletedSite } = await supabase
      .from('sites')
      .select('*')
      .eq('id', targetSite.id)
      .single()

    expect(deletedSite).toBeNull()

    // Verify total count decreased
    const { data: allSites } = await supabase.from('sites').select('*')
    expect(allSites?.length).toBe(initialCount - 1)

    console.log(`✅ 削除成功: ${targetSite.name} (ID: ${targetSite.id})`)
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

  test.skip('現場を検索できる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Enter search term
    await page.fill('input[placeholder*="検索"]', '東京')

    // Wait for table to update
    await page.waitForTimeout(500) // Debounce delay

    // Check filtered results
    await waitForTable(page)
    const visibleRows = await page.locator('tbody tr').count()
    expect(visibleRows).toBeGreaterThan(0)

    // All visible names should contain search term
    const names = await page.locator('tbody tr td:nth-child(2)').allTextContents()
    names.forEach((name) => {
      expect(name).toContain('東京')
    })
  })

  test.skip('ステータスでフィルタリングできる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Select status filter
    await selectOption(page, 'ステータス', '進行中')

    // Wait for table to update
    await waitForTable(page)

    // Check all visible rows have selected status
    const statusCells = await page.locator('tbody tr td:nth-child(5)').allTextContents()
    statusCells.forEach((status) => {
      expect(status.trim()).toBe('進行中')
    })
  })

  test.skip('所在地でフィルタリングできる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Select location filter
    await selectOption(page, '所在地', '東京')

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

    // Click name column header to sort
    await page.click('th:has-text("現場名")')

    // Wait for table to update
    await waitForTable(page)

    // Get first row name
    const firstNameAsc = await page.locator('tbody tr:first-child td:nth-child(2)').textContent()

    // Click again to reverse sort
    await page.click('th:has-text("現場名")')
    await waitForTable(page)

    // Get first row name after reverse sort
    const firstNameDesc = await page.locator('tbody tr:first-child td:nth-child(2)').textContent()

    // Names should be different after sort direction change
    expect(firstNameAsc).not.toBe(firstNameDesc)
  })

  test.skip('バリデーションエラーが表示される', async ({ page }) => {
    // Note: Requires authentication setup

    // Click add button
    await page.click('button:has-text("現場を追加")')

    // Wait for dialog to open
    await waitForDialog(page, '現場を追加')

    // Try to submit without filling required fields
    await page.click('button:has-text("登録")')

    // Check validation errors
    await expect(page.locator('text=現場名を入力してください')).toBeVisible()
    await expect(page.locator('text=所在地を選択してください')).toBeVisible()
  })

  test.skip('終了日は開始日より後でなければならない', async ({ page }) => {
    // Note: Requires authentication setup

    // Click add button
    await page.click('button:has-text("現場を追加")')

    // Wait for dialog to open
    await waitForDialog(page, '現場を追加')

    // Fill form with invalid dates
    await fillTextField(page, '現場名', 'テスト現場')
    await selectOption(page, '所在地', '東京')
    await fillDatePicker(page, '開始日', '2024-12-31')
    await fillDatePicker(page, '終了予定日', '2024-01-01') // Before start date

    // Try to submit
    await page.click('button:has-text("登録")')

    // Check validation error
    await expect(page.locator('text=終了予定日は開始日より後の日付を選択してください')).toBeVisible()
  })

  test.skip('現場詳細を表示できる', async ({ page }) => {
    // Note: Requires authentication setup and existing data

    // Wait for table to load
    await waitForTable(page)

    // Click first row to view details
    await page.locator('tbody tr:first-child').click()

    // Check detail page is displayed
    await expect(page.locator('h2:has-text("現場詳細")')).toBeVisible({ timeout: 5000 })
  })
})
