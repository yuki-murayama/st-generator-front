import { test, expect } from '@playwright/test'
import { getSupabaseClient } from './supabase-helper'

const supabase = getSupabaseClient()

test.describe('ダッシュボード統計情報', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (no authentication required in dev mode)
    await page.goto('/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('ダッシュボードページが表示される', async ({ page }) => {
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
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible()

    // Check stats cards are visible
    await expect(page.locator('text=従業員数')).toBeVisible()
    await expect(page.locator('text=現場数')).toBeVisible()
    await expect(page.locator('text=配属中')).toBeVisible()

    // Check quick actions
    await expect(page.locator('button:has-text("従業員登録")')).toBeVisible()
    await expect(page.locator('button:has-text("現場登録")')).toBeVisible()
    await expect(page.locator('button:has-text("配属登録")')).toBeVisible()

    // Check activity feed
    await expect(page.locator('text=最近の活動')).toBeVisible()

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('従業員数がDBデータと一致する', async ({ page }) => {
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

    // Get actual count from database (only active employees)
    const { data: employees, error: employeesError} = await supabase
      .from('employees')
      .select('id, status')
      .eq('status', 'active')

    expect(employeesError).toBeNull()
    const actualEmployeeCount = employees?.length || 0

    // Wait for stats to load (no skeleton visible)
    await expect(page.locator('.MuiSkeleton-root')).not.toBeVisible({ timeout: 10000 })

    // Get displayed count from dashboard
    const statsText = await page.locator('text=従業員数').locator('..').textContent()
    const displayedCount = statsText?.match(/\d+/)?.[0] || '0'

    // Compare counts
    expect(parseInt(displayedCount)).toBe(actualEmployeeCount)
    console.log(`従業員数: 期待値=${actualEmployeeCount}, 表示値=${displayedCount}`)

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('現場数がDBデータと一致する（稼働中のみ）', async ({ page }) => {
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

    // Get actual count from database (only active sites)
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('id, status')
      .eq('status', 'active')

    expect(sitesError).toBeNull()
    const actualSiteCount = sites?.length || 0

    // Wait for stats to load
    await expect(page.locator('.MuiSkeleton-root')).not.toBeVisible({ timeout: 10000 })

    // Get displayed count from dashboard
    const statsText = await page.locator('text=現場数').locator('..').textContent()
    const displayedCount = statsText?.match(/\d+/)?.[0] || '0'

    // Compare counts
    expect(parseInt(displayedCount)).toBe(actualSiteCount)
    console.log(`現場数: 期待値=${actualSiteCount}, 表示値=${displayedCount}`)

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('配属中の数がDBデータと一致する', async ({ page }) => {
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

    // Get actual count from database (active assignments only: end_date is null)
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('id, end_date')
      .is('end_date', null)

    expect(assignmentsError).toBeNull()
    const actualActiveCount = assignments?.length || 0

    // Wait for stats to load
    await expect(page.locator('.MuiSkeleton-root')).not.toBeVisible({ timeout: 10000 })

    // Get displayed count from dashboard
    const statsText = await page.locator('text=配属中').locator('..').textContent()
    const displayedCount = statsText?.match(/\d+/)?.[0] || '0'

    // Compare counts
    expect(parseInt(displayedCount)).toBe(actualActiveCount)
    console.log(`配属中: 期待値=${actualActiveCount}, 表示値=${displayedCount}`)

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('全ての統計情報が正しく表示される', async ({ page }) => {
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

    // Get all data from database
    const [employeesResult, sitesResult, assignmentsResult] = await Promise.all([
      supabase.from('employees').select('id, status').eq('status', 'active'),
      supabase.from('sites').select('id, status').eq('status', 'active'),
      supabase.from('assignments').select('id, end_date').is('end_date', null)
    ])

    expect(employeesResult.error).toBeNull()
    expect(sitesResult.error).toBeNull()
    expect(assignmentsResult.error).toBeNull()

    const expectedCounts = {
      employees: employeesResult.data?.length || 0,
      sites: sitesResult.data?.length || 0,
      assignments: assignmentsResult.data?.length || 0,
    }

    // Wait for stats to load (no loading skeleton)
    await expect(page.locator('.MuiSkeleton-root')).not.toBeVisible({ timeout: 10000 })

    // Get all displayed counts
    const employeeText = await page.locator('text=従業員数').locator('..').textContent()
    const siteText = await page.locator('text=現場数').locator('..').textContent()
    const assignmentText = await page.locator('text=配属中').locator('..').textContent()

    const displayedCounts = {
      employees: parseInt(employeeText?.match(/\d+/)?.[0] || '0'),
      sites: parseInt(siteText?.match(/\d+/)?.[0] || '0'),
      assignments: parseInt(assignmentText?.match(/\d+/)?.[0] || '0'),
    }

    // Compare all counts
    expect(displayedCounts.employees).toBe(expectedCounts.employees)
    expect(displayedCounts.sites).toBe(expectedCounts.sites)
    expect(displayedCounts.assignments).toBe(expectedCounts.assignments)

    // Log for debugging
    console.log('Expected counts:', expectedCounts)
    console.log('Displayed counts:', displayedCounts)

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('クイックアクションが機能する', async ({ page }) => {
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

    // Test employee registration button
    await page.click('button:has-text("従業員登録")')
    await expect(page).toHaveURL('/employees/new', { timeout: 5000 })
    await page.goBack()

    // Test site registration button
    await page.click('button:has-text("現場登録")')
    await expect(page).toHaveURL('/sites/new', { timeout: 5000 })
    await page.goBack()

    // Test assignment button
    await page.click('button:has-text("配属登録")')
    await expect(page).toHaveURL('/assignments', { timeout: 5000 })

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('最近の活動が表示される', async ({ page }) => {
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

    // Wait for activity feed to load
    await expect(page.locator('text=最近の活動')).toBeVisible({ timeout: 10000 })

    // Check that activities section exists
    const activitySection = page.locator('text=最近の活動').locator('..')
    await expect(activitySection).toBeVisible()

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })
})
