// Export all types from a central location for easier imports
import { ComponentType } from 'react'

// Common types
export * from './common'

// Entity types
export * from './employee'
export * from './site'
export * from './assignment'

// Auth types
export interface User {
  id: string
  email: string
  user_metadata?: {
    first_name?: string
    last_name?: string
    role?: string
  }
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  first_name: string
  last_name: string
}

// UI component types
export interface TableColumn<T> {
  id: keyof T
  label: string
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => string
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string | null
  onRowClick?: (row: T) => void
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
  }
}

export interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  loading?: boolean
}

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  severity?: 'info' | 'warning' | 'error'
}

// Form types
export interface FormFieldProps {
  name: string
  label: string
  required?: boolean
  error?: string
  helperText?: string
  disabled?: boolean
}

export interface SelectFieldProps extends FormFieldProps {
  options: Array<{ value: string; label: string }>
  multiple?: boolean
}

export interface DateFieldProps extends FormFieldProps {
  minDate?: Date
  maxDate?: Date
}

// Dashboard types
export interface DashboardStats {
  employees: {
    total: number
    active: number
    inactive: number
  }
  sites: {
    total: number
    active: number
    completed: number
    suspended: number
  }
  assignments: {
    total: number
    active: number
    ending_soon: number
  }
}

export interface ActivityItem {
  id: string
  type: 'employee_created' | 'employee_updated' | 'site_created' | 'site_updated' | 'assignment_created' | 'assignment_deleted'
  message: string
  timestamp: Date
  user?: string
  entity_id?: string
  entity_type?: 'employee' | 'site' | 'assignment'
}

// Navigation types
export interface RouteConfig {
  path: string
  component: ComponentType
  exact?: boolean
  protected?: boolean
  title?: string
  breadcrumb?: string
}

// Error handling types
export interface AppError extends Error {
  code?: string
  status?: number
  context?: Record<string, any>
}

// Theme types
export interface ThemeConfig {
  mode: 'light' | 'dark'
  primaryColor: string
  language: string
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}