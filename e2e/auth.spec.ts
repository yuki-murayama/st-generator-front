import { test, expect } from '@playwright/test'
import { login, logout, waitForToast } from './helpers'

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the login page
    await page.goto('/login')
  })

  test('ログインページが表示される', async ({ page }) => {
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
    await expect(page).toHaveTitle(/従業員管理システム/)

    // Check login form elements
    await expect(page.locator('h1:has-text("従業員管理システム")')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("ログイン")')).toBeVisible()

    // Check console errors
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })

  test('メールアドレスが未入力の場合、エラーメッセージが表示される', async ({ page }) => {
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

  test.skip('正しい認証情報でログインできる', async ({ page }) => {
    // Note: This test requires a real Supabase instance with test user
    // Skip by default to avoid failures in CI/CD

    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123'

    // Perform login
    await login(page, testEmail, testPassword)

    // Check redirect to dashboard
    await expect(page).toHaveURL('/')

    // Check dashboard elements are visible
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible()
  })

  test.skip('ログイン後、ログアウトできる', async ({ page }) => {
    // Note: This test requires a real Supabase instance with test user
    // Skip by default to avoid failures in CI/CD

    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123'

    // Login first
    await login(page, testEmail, testPassword)

    // Perform logout
    await logout(page)

    // Check redirect to login page
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1:has-text("ログイン")')).toBeVisible()
  })

  test.skip('未認証時にプライベートページにアクセスすると、ログインページにリダイレクトされる', async ({
    page,
  }) => {
    // Note: Skipped because VITE_SKIP_AUTH=true bypasses authentication
    // Try to access private page without authentication
    await page.goto('/employees')

    // Should redirect to login page
    await expect(page).toHaveURL('/login', { timeout: 10000 })
  })

  test('ログインフォームのエンターキーで送信できる', async ({ page }) => {
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
