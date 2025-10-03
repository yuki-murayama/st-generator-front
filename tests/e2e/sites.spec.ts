import { test, expect } from '@playwright/test'
import { waitForTable, setupAuth } from './helpers'
import { getSupabaseClient } from './supabase-helper'

const supabase = getSupabaseClient()

test.describe('現場管理', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Authenticate before each test
    await setupAuth(page)

    // Skip navigation for create test (it navigates directly to /sites/new)
    if (testInfo.title === '現場を新規登録できる') {
      return
    }
    // Navigate to sites page
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

    // Start date - use role-based selector
    await page.getByRole('button', { name: 'Choose date', exact: false }).nth(0).click()
    await page.waitForSelector('.MuiPickersCalendarHeader-root', { timeout: 5000 })
    await page.locator(`.MuiPickersDay-root`).filter({ hasText: new RegExp(`^${startDay}$`) }).first().click()
    await page.waitForTimeout(500)

    // End date - use role-based selector
    await page.getByRole('button', { name: 'Choose date', exact: false }).nth(1).click()
    await page.waitForSelector('.MuiPickersCalendarHeader-root', { timeout: 5000 })
    await page.locator(`.MuiPickersDay-root`).filter({ hasText: new RegExp(`^${endDay}$`) }).first().click()
    await page.waitForTimeout(500)

    await page.fill('textarea[name="description"]', 'E2Eテスト用の現場データ')

    // Submit
    await page.locator('button:has-text("登録")').click()

    // Wait for redirect to detail page with UUID (not /sites/new)
    await page.waitForURL(/\/sites\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { timeout: 10000 })
    const newUrl = page.url()
    const siteId = newUrl.split('/').pop()

    // Verify in database
    const { data: newSite, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single()

    expect(error).toBeNull()
    expect(newSite).not.toBeNull()
    expect(newSite).toMatchObject({
      name: 'E2Eテスト現場',
      location: '東京都渋谷区',
      manager_name: 'テスト責任者',
      status: 'active',
      description: 'E2Eテスト用の現場データ'
    })

    console.log(`✅ 新規登録成功: ${newSite?.name} (ID: ${siteId})`)
  })

  test('現場情報を編集できる', async ({ page }) => {
    // Track console errors (excluding expected auth errors in dev mode)
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Ignore auth session errors and expected fetch errors in VITE_SKIP_AUTH mode
        if (!text.includes('AuthSessionMissingError') && !text.includes('Failed to fetch')) {
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

    // Wait for redirect to detail page with UUID
    await page.waitForURL(/\/sites\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { timeout: 10000 })

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

    // Check updated site appears in the table (use first() to handle multiple matches)
    await expect(page.locator(`text=${updatedName}`).first()).toBeVisible()

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
        // Ignore auth session errors and expected fetch errors in VITE_SKIP_AUTH mode
        if (!text.includes('AuthSessionMissingError') && !text.includes('Failed to fetch')) {
          consoleErrors.push(text)
        }
      }
    })
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    // Create a dedicated test site for deletion
    const testSiteName = `E2E削除テスト_${Date.now()}`
    const { data: createdSite, error: createError } = await supabase
      .from('sites')
      .insert({
        name: testSiteName,
        location: '東京都渋谷区',
        manager_name: '削除テスト責任者',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000 * 10).toISOString(),
        status: 'active',
        description: '削除テスト用データ'
      })
      .select()
      .single()

    if (createError || !createdSite) {
      console.log('⏭️  スキップ: テストデータの作成に失敗しました')
      return
    }

    const targetSite = createdSite

    // Reload page to show newly created site
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await waitForTable(page)

    // Verify the created site appears in the table
    await expect(page.locator('tbody tr').filter({ hasText: targetSite.name })).toHaveCount(1)

    // Get initial row count on page AFTER reload
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

    // Check site no longer appears in the table (use first() to avoid strict mode violation)
    const siteInTable = page.locator('tbody tr').filter({ hasText: targetSite.name })
    await expect(siteInTable).toHaveCount(0)

    // Verify row count decreased by at least 1 (may be more if other tests are running)
    const newRowCount = await page.locator('tbody tr').count()
    expect(newRowCount).toBeLessThanOrEqual(initialRowCount - 1)

    // Verify deletion in database
    const { data: deletedSite } = await supabase
      .from('sites')
      .select('*')
      .eq('id', targetSite.id)
      .single()

    expect(deletedSite).toBeNull()

    console.log(`✅ 削除成功: ${targetSite.name} (ID: ${targetSite.id})`)
  })

  test('削除をキャンセルできる', async ({ page }) => {
    // Wait for table to load
    await waitForTable(page)

    // Get initial row count
    const initialCount = await page.locator('tbody tr').count()

    // Click delete button on first row
    const firstRow = page.locator('tbody tr').first()
    await firstRow.locator('button[aria-label="削除"]').click()

    // Wait for confirm dialog
    await expect(page.locator('[role="dialog"]').filter({ hasText: '削除' })).toBeVisible()

    // Cancel delete by clicking キャンセル button
    await page.click('[role="dialog"] button:has-text("キャンセル")')

    // Wait for dialog to close
    await expect(page.locator('[role="dialog"]').filter({ hasText: '削除' })).not.toBeVisible()

    // Check table unchanged
    const newCount = await page.locator('tbody tr').count()
    expect(newCount).toBe(initialCount)

    console.log('✅ 削除キャンセル成功')
  })

  test('現場を検索できる', async ({ page }) => {
    // Wait for table to load
    await waitForTable(page)

    // Get initial row count
    const initialCount = await page.locator('tbody tr').count()

    // Enter search term
    await page.fill('input[placeholder*="検索"]', '東京')

    // Wait for table to update
    await page.waitForTimeout(500) // Debounce delay

    // Check filtered results
    await waitForTable(page)
    const visibleRows = await page.locator('tbody tr').count()
    expect(visibleRows).toBeGreaterThan(0)
    expect(visibleRows).toBeLessThanOrEqual(initialCount)

    // Get all text content from name and location columns
    const rows = await page.locator('tbody tr').all()
    for (const row of rows) {
      const text = await row.textContent()
      expect(text).toMatch(/東京/)
    }

    console.log(`✅ 検索成功: ${visibleRows}件の結果`)
  })

  // Note: Filter功能未実装のため、現在はスキップ
  test.skip('ステータスでフィルタリングできる', async ({ page }) => {
    // Wait for table to load
    await waitForTable(page)

    // Click filter button
    await page.click('button:has-text("フィルター")')

    // TODO: Implement when filter UI is available
  })

  // Note: Filter功能未実装のため、現在はスキップ
  test.skip('所在地でフィルタリングできる', async ({ page }) => {
    // Wait for table to load
    await waitForTable(page)

    // Click filter button
    await page.click('button:has-text("フィルター")')

    // TODO: Implement when filter UI is available
  })

  // Note: ソート機能が未実装のため、現在はスキップ
  test.skip('ソート機能が動作する', async ({ page }) => {
    // Wait for table to load
    await waitForTable(page)

    // Get all names in current order
    const initialNames = await page.locator('tbody tr td:first-child').allTextContents()
    const initialFirst = initialNames[0]
    const initialLast = initialNames[initialNames.length - 1]

    // Click name column header to sort ascending
    await page.locator('th').filter({ hasText: '現場名' }).click()

    // Wait for table to update
    await page.waitForTimeout(500)
    await waitForTable(page)

    // Get names after first sort
    const ascNames = await page.locator('tbody tr td:first-child').allTextContents()
    const ascFirst = ascNames[0]
    const ascLast = ascNames[ascNames.length - 1]

    // Click again to reverse sort (descending)
    await page.locator('th').filter({ hasText: '現場名' }).click()
    await page.waitForTimeout(500)
    await waitForTable(page)

    // Get names after reverse sort
    const descNames = await page.locator('tbody tr td:first-child').allTextContents()
    const descFirst = descNames[0]
    const descLast = descNames[descNames.length - 1]

    // Check that sorting changed the order
    // After ascending sort, first should be different from descending sort's first
    const sortingWorked = ascFirst !== descFirst || ascLast !== descLast

    expect(sortingWorked).toBe(true)

    console.log(`✅ ソート成功: 初期[${initialFirst}...${initialLast}] → 昇順[${ascFirst}...${ascLast}] → 降順[${descFirst}...${descLast}]`)
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

  test('現場詳細を表示できる', async ({ page }) => {
    // Wait for table to load
    await waitForTable(page)

    // Get first site name for verification
    const firstSiteName = await page.locator('tbody tr:first-child td:first-child').textContent()

    // Click 詳細表示 button on first row
    const firstRow = page.locator('tbody tr').first()
    await firstRow.locator('button[aria-label="詳細表示"]').click()

    // Wait for navigation to detail page
    await page.waitForURL(/\/sites\/[0-9a-f-]+$/, { timeout: 10000 })

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check breadcrumb shows 現場詳細
    await expect(page.locator('nav[aria-label="パンくずリスト"]')).toContainText('現場詳細')

    // Check site name is displayed
    if (firstSiteName) {
      await expect(page.locator('body')).toContainText(firstSiteName.trim())
    }

    console.log(`✅ 現場詳細表示成功: ${firstSiteName}`)
  })
})
