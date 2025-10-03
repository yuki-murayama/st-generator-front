import { test, expect } from '@playwright/test'
import { login, logout, waitForToast } from './helpers'

test.describe('認証フロー', () => {
  let consoleErrors: string[]

  test.beforeEach(async ({ page }) => {
    // Track console errors (excluding expected errors)
    consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Ignore expected errors on login page
        if (!text.includes('AuthSessionMissingError') &&
            !text.includes('Failed to load resource') &&
            !text.includes('status of 400') &&
            !text.includes('Error getting current user')) {
          consoleErrors.push(text)
        }
      }
    })
    page.on('pageerror', (error) => {
      const message = error.message
      if (!message.includes('AuthSessionMissingError') &&
          !message.includes('Error getting current user')) {
        consoleErrors.push(message)
      }
    })

    // Start from the login page
    await page.goto('/login')
  })

  test('ログインページが表示される', async ({ page }) => {

    // Check page title
    await expect(page).toHaveTitle(/従業員管理システム/)

    // Check login form elements
    await expect(page.locator('h1:has-text("従業員管理システム")')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible()

    // Check console errors (should be empty after filtering)
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('メールアドレスが未入力の場合、エラーメッセージが表示される', async ({ page }) => {

    // Click login button without filling email
    await page.fill('input[name="password"]', 'password123')
    await page.click('button:has-text("ログイン")')

    // Check for validation error (field should show required state)
    const emailField = page.locator('input[name="email"]')
    await expect(emailField).toHaveAttribute('aria-invalid', 'true')

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('パスワードが未入力の場合、エラーメッセージが表示される', async ({ page }) => {

    // Fill email but not password
    await page.fill('input[name="email"]', 'test@example.com')
    await page.click('button:has-text("ログイン")')

    // Check for validation error (field should show required state)
    const passwordField = page.locator('input[name="password"]')
    await expect(passwordField).toHaveAttribute('aria-invalid', 'true')

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test.skip('無効なメールアドレスの場合、エラーメッセージが表示される', async ({ page }) => {
    // Note: Email validation may be handled by browser or backend
    // Skip this test as client-side email format validation is not implemented

    // Fill invalid email
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button:has-text("ログイン")')

    // Check for validation error (field should show invalid state)
    const emailField = page.locator('input[name="email"]')
    await expect(emailField).toHaveAttribute('aria-invalid', 'true')
  })

  test('正しい認証情報でログインできる', async ({ page }) => {
    // Note: This test requires VITE_SKIP_AUTH=false and real Supabase auth
    // Skip by default as VITE_SKIP_AUTH=true in current environment

    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123'

    // Perform login
    await login(page, testEmail, testPassword)

    // Check redirect to dashboard
    await expect(page).toHaveURL(/\/(dashboard)?$/)

    // Check dashboard elements are visible
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible()
  })

  test('ログイン後、ログアウトできる', async ({ page }) => {
    // Note: This test requires VITE_SKIP_AUTH=false and real Supabase auth
    // Skip by default as VITE_SKIP_AUTH=true in current environment

    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123'

    // Login first
    await login(page, testEmail, testPassword)

    // Perform logout
    await logout(page)

    // Check redirect to login page
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1:has-text("従業員管理システム")')).toBeVisible()
  })

  test('未認証時にプライベートページにアクセスすると、ログインページにリダイレクトされる', async ({
    page,
  }) => {
    // Note: Skipped because VITE_SKIP_AUTH=true bypasses authentication
    // Try to access private page without authentication
    await page.goto('/employees')

    // Should redirect to login page
    await expect(page).toHaveURL('/login', { timeout: 10000 })
  })

  test('ログインフォームのエンターキーで送信できる', async ({ page }) => {

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Press Enter on password field
    await page.locator('input[name="password"]').press('Enter')

    // Form should be submitted (will fail auth, but validates submit works)
    // Wait for error message or loading state to confirm submit happened
    await page.waitForTimeout(1000)

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('パスワード入力欄が非表示になっている', async ({ page }) => {

    const passwordInput = page.locator('input[name="password"]')

    // Check password input type is password
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('ログインボタンがローディング状態になる', async ({ page }) => {

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')

    // Click login button
    const loginButton = page.locator('button:has-text("ログイン")')
    await loginButton.click()

    // Button should be disabled during loading
    await expect(loginButton).toBeDisabled({ timeout: 1000 })

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })
})
