/**
 * Navigation Testing Helper Functions
 * Utilities for testing navigation flows and route behavior
 */

/**
 * Route definitions for testing
 */
export const ROUTES = {
  // Public routes
  LOGIN: '/login',

  // Protected routes
  DASHBOARD: '/dashboard',

  // Employee routes
  EMPLOYEES: '/employees',
  EMPLOYEE_NEW: '/employees/new',
  EMPLOYEE_DETAIL: (id: string | number) => `/employees/${id}`,
  EMPLOYEE_EDIT: (id: string | number) => `/employees/${id}/edit`,

  // Site routes
  SITES: '/sites',
  SITE_NEW: '/sites/new',
  SITE_DETAIL: (id: string | number) => `/sites/${id}`,
  SITE_EDIT: (id: string | number) => `/sites/${id}/edit`,

  // Assignment routes
  ASSIGNMENTS: '/assignments',
  ASSIGNMENTS_WITH_EMPLOYEE: (employeeId: string | number) => `/assignments?employee=${employeeId}`,
  ASSIGNMENTS_WITH_SITE: (siteId: string | number) => `/assignments?site=${siteId}`,

  // Profile route
  PROFILE: '/profile',
}

/**
 * Expected breadcrumb paths for each route
 */
export const EXPECTED_BREADCRUMBS = {
  DASHBOARD: ['ホーム', 'ダッシュボード'],
  EMPLOYEES: ['ホーム', '従業員管理', '一覧'],
  EMPLOYEE_NEW: ['ホーム', '従業員管理', '一覧', '新規登録'],
  EMPLOYEE_DETAIL: ['ホーム', '従業員管理', '一覧'], // + employee name
  EMPLOYEE_EDIT: ['ホーム', '従業員管理', '一覧'], // + employee name + '編集'
  SITES: ['ホーム', '現場管理', '一覧'],
  SITE_NEW: ['ホーム', '現場管理', '一覧', '新規登録'],
  SITE_DETAIL: ['ホーム', '現場管理', '一覧'], // + site name
  SITE_EDIT: ['ホーム', '現場管理', '一覧'], // + site name + '編集'
  ASSIGNMENTS: ['ホーム', '配属管理'],
  PROFILE: ['ホーム', 'プロフィール'],
}

/**
 * Navigation test scenarios
 */
export const NAVIGATION_SCENARIOS = {
  // From Dashboard
  FROM_DASHBOARD: [
    { from: ROUTES.DASHBOARD, to: ROUTES.EMPLOYEES, via: 'nav-link' },
    { from: ROUTES.DASHBOARD, to: ROUTES.SITES, via: 'nav-link' },
    { from: ROUTES.DASHBOARD, to: ROUTES.ASSIGNMENTS, via: 'nav-link' },
    { from: ROUTES.DASHBOARD, to: ROUTES.PROFILE, via: 'user-menu' },
    { from: ROUTES.DASHBOARD, to: ROUTES.EMPLOYEE_NEW, via: 'quick-action' },
    { from: ROUTES.DASHBOARD, to: ROUTES.SITE_NEW, via: 'quick-action' },
  ],

  // Employee Management Flow
  EMPLOYEE_FLOW: [
    { from: ROUTES.EMPLOYEES, to: ROUTES.EMPLOYEE_NEW, via: 'button' },
    { from: ROUTES.EMPLOYEES, to: ROUTES.EMPLOYEE_DETAIL('1'), via: 'list-item' },
    { from: ROUTES.EMPLOYEE_DETAIL('1'), to: ROUTES.EMPLOYEE_EDIT('1'), via: 'button' },
    { from: ROUTES.EMPLOYEE_EDIT('1'), to: ROUTES.EMPLOYEE_DETAIL('1'), via: 'cancel' },
    { from: ROUTES.EMPLOYEE_DETAIL('1'), to: ROUTES.EMPLOYEES, via: 'back' },
  ],

  // Site Management Flow
  SITE_FLOW: [
    { from: ROUTES.SITES, to: ROUTES.SITE_NEW, via: 'button' },
    { from: ROUTES.SITES, to: ROUTES.SITE_DETAIL('1'), via: 'list-item' },
    { from: ROUTES.SITE_DETAIL('1'), to: ROUTES.SITE_EDIT('1'), via: 'button' },
    { from: ROUTES.SITE_EDIT('1'), to: ROUTES.SITE_DETAIL('1'), via: 'cancel' },
    { from: ROUTES.SITE_DETAIL('1'), to: ROUTES.SITES, via: 'back' },
    { from: ROUTES.SITE_DETAIL('1'), to: ROUTES.ASSIGNMENTS_WITH_SITE('1'), via: 'button' },
  ],

  // Assignment Flow
  ASSIGNMENT_FLOW: [
    { from: ROUTES.EMPLOYEE_DETAIL('1'), to: ROUTES.ASSIGNMENTS_WITH_EMPLOYEE('1'), via: 'button' },
    { from: ROUTES.SITE_DETAIL('1'), to: ROUTES.ASSIGNMENTS_WITH_SITE('1'), via: 'button' },
  ],
}

/**
 * Check if a route requires authentication
 */
export const requiresAuth = (path: string): boolean => {
  const publicRoutes = [ROUTES.LOGIN]
  return !publicRoutes.includes(path)
}

/**
 * Extract route parameters from a path
 */
export const extractParams = (path: string): Record<string, string> => {
  const params: Record<string, string> = {}
  const match = path.match(/\/(\d+)/)
  if (match) {
    params.id = match[1]
  }
  return params
}

/**
 * Extract query parameters from a URL
 */
export const extractQueryParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {}
  const queryString = url.split('?')[1]
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=')
      params[key] = value
    })
  }
  return params
}

/**
 * Validate navigation state
 */
export interface NavigationState {
  currentPath: string
  isAuthenticated: boolean
  hasError: boolean
}

export const validateNavigation = (
  state: NavigationState,
  expectedPath: string
): { valid: boolean; message?: string } => {
  // Check authentication requirement
  if (requiresAuth(expectedPath) && !state.isAuthenticated) {
    return {
      valid: false,
      message: 'Route requires authentication but user is not authenticated',
    }
  }

  // Check if there's an error
  if (state.hasError) {
    return {
      valid: false,
      message: 'Navigation resulted in an error',
    }
  }

  // Check if current path matches expected path
  if (state.currentPath !== expectedPath) {
    return {
      valid: false,
      message: `Expected path ${expectedPath} but got ${state.currentPath}`,
    }
  }

  return { valid: true }
}

/**
 * Test data for navigation testing
 */
export const TEST_DATA = {
  VALID_EMPLOYEE_ID: '1',
  INVALID_EMPLOYEE_ID: '999999',
  VALID_SITE_ID: '1',
  INVALID_SITE_ID: '999999',
  NON_EXISTENT_PATH: '/non-existent-path',
}

/**
 * Expected redirect scenarios
 */
export const REDIRECT_SCENARIOS = [
  {
    description: 'Root path redirects to dashboard when authenticated',
    from: '/',
    to: ROUTES.DASHBOARD,
    requiresAuth: true,
  },
  {
    description: 'Protected route redirects to login when not authenticated',
    from: ROUTES.EMPLOYEES,
    to: ROUTES.LOGIN,
    requiresAuth: false,
  },
  {
    description: 'Login redirects to dashboard when already authenticated',
    from: ROUTES.LOGIN,
    to: ROUTES.DASHBOARD,
    requiresAuth: true,
  },
]

/**
 * Button-specific navigation map (from design document)
 */
export const BUTTON_NAVIGATION_MAP = {
  DASHBOARD: {
    '従業員登録': ROUTES.EMPLOYEE_NEW,
    '現場登録': ROUTES.SITE_NEW,
    '配属登録': ROUTES.ASSIGNMENTS,
  },
  EMPLOYEE_LIST: {
    '新規登録': ROUTES.EMPLOYEE_NEW,
    '詳細': ROUTES.EMPLOYEE_DETAIL, // Function
  },
  EMPLOYEE_DETAIL: {
    '編集': ROUTES.EMPLOYEE_EDIT, // Function
    '一覧に戻る': ROUTES.EMPLOYEES,
  },
  EMPLOYEE_FORM: {
    '保存': ROUTES.EMPLOYEE_DETAIL, // After save
    'キャンセル': ROUTES.EMPLOYEES, // Or detail if editing
  },
  SITE_LIST: {
    '新規登録': ROUTES.SITE_NEW,
    '詳細': ROUTES.SITE_DETAIL, // Function
  },
  SITE_DETAIL: {
    '編集': ROUTES.SITE_EDIT, // Function
    '配属管理': ROUTES.ASSIGNMENTS_WITH_SITE, // Function
    '一覧に戻る': ROUTES.SITES,
  },
  SITE_FORM: {
    '保存': ROUTES.SITE_DETAIL, // After save
    'キャンセル': ROUTES.SITES, // Or detail if editing
  },
  ASSIGNMENT: {
    '保存': ROUTES.ASSIGNMENTS, // Refresh list
  },
}