import { User } from '../types'

/**
 * Permission levels for different user roles
 */
export enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin'
}

/**
 * User roles with associated permissions
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer'
}

/**
 * Role-based permission mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN],
  [UserRole.MANAGER]: [Permission.READ, Permission.WRITE, Permission.DELETE],
  [UserRole.EMPLOYEE]: [Permission.READ, Permission.WRITE],
  [UserRole.VIEWER]: [Permission.READ]
}

/**
 * Get user role from user metadata
 */
export const getUserRole = (user: User | null): UserRole => {
  if (!user || !user.user_metadata?.role) {
    return UserRole.VIEWER
  }

  const role = user.user_metadata.role.toLowerCase()

  switch (role) {
    case 'admin':
      return UserRole.ADMIN
    case 'manager':
      return UserRole.MANAGER
    case 'employee':
      return UserRole.EMPLOYEE
    default:
      return UserRole.VIEWER
  }
}

/**
 * Check if user has required permission
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) {
    return false
  }

  const userRole = getUserRole(user)
  const permissions = ROLE_PERMISSIONS[userRole]

  return permissions.includes(permission)
}

/**
 * Check if user has any of the required permissions
 */
export const hasAnyPermission = (user: User | null, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Check if user has all of the required permissions
 */
export const hasAllPermissions = (user: User | null, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Navigation guards for different sections of the application
 */
export const navigationGuards = {
  /**
   * Check if user can access dashboard
   */
  canAccessDashboard: (user: User | null): boolean => {
    return hasPermission(user, Permission.READ)
  },

  /**
   * Check if user can manage employees
   */
  canManageEmployees: (user: User | null): boolean => {
    return hasPermission(user, Permission.WRITE)
  },

  /**
   * Check if user can delete employees
   */
  canDeleteEmployees: (user: User | null): boolean => {
    return hasPermission(user, Permission.DELETE)
  },

  /**
   * Check if user can manage sites
   */
  canManageSites: (user: User | null): boolean => {
    return hasPermission(user, Permission.WRITE)
  },

  /**
   * Check if user can delete sites
   */
  canDeleteSites: (user: User | null): boolean => {
    return hasPermission(user, Permission.DELETE)
  },

  /**
   * Check if user can manage assignments
   */
  canManageAssignments: (user: User | null): boolean => {
    return hasPermission(user, Permission.WRITE)
  },

  /**
   * Check if user can delete assignments
   */
  canDeleteAssignments: (user: User | null): boolean => {
    return hasPermission(user, Permission.DELETE)
  },

  /**
   * Check if user can access admin settings
   */
  canAccessAdminSettings: (user: User | null): boolean => {
    return hasPermission(user, Permission.ADMIN)
  },

  /**
   * Check if user can view employee details
   */
  canViewEmployeeDetails: (user: User | null): boolean => {
    return hasPermission(user, Permission.READ)
  },

  /**
   * Check if user can view site details
   */
  canViewSiteDetails: (user: User | null): boolean => {
    return hasPermission(user, Permission.READ)
  }
}

/**
 * Route protection configuration
 */
export interface RouteGuard {
  path: string
  guard: (user: User | null) => boolean
  redirectTo?: string
}

/**
 * Protected routes configuration
 */
export const protectedRoutes: RouteGuard[] = [
  {
    path: '/dashboard',
    guard: navigationGuards.canAccessDashboard
  },
  {
    path: '/employees',
    guard: navigationGuards.canViewEmployeeDetails
  },
  {
    path: '/employees/new',
    guard: navigationGuards.canManageEmployees
  },
  {
    path: '/employees/:id/edit',
    guard: navigationGuards.canManageEmployees
  },
  {
    path: '/sites',
    guard: navigationGuards.canViewSiteDetails
  },
  {
    path: '/sites/new',
    guard: navigationGuards.canManageSites
  },
  {
    path: '/sites/:id/edit',
    guard: navigationGuards.canManageSites
  },
  {
    path: '/assignments',
    guard: navigationGuards.canManageAssignments
  },
  {
    path: '/admin',
    guard: navigationGuards.canAccessAdminSettings,
    redirectTo: '/dashboard'
  }
]

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (path: string, user: User | null): boolean => {
  const route = protectedRoutes.find(route => {
    // Simple pattern matching - in production, you might want to use a proper router matcher
    if (route.path.includes(':')) {
      const pattern = route.path.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(path)
    }
    return route.path === path
  })

  if (!route) {
    // If route is not explicitly protected, allow access
    return true
  }

  return route.guard(user)
}

/**
 * Get redirect path for unauthorized access
 */
export const getRedirectPath = (path: string): string => {
  const route = protectedRoutes.find(route => route.path === path)
  return route?.redirectTo || '/login'
}