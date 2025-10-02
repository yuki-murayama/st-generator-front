// Common types used across the application

export interface BaseEntity {
  id: string
  created_at: Date
  updated_at: Date
}

export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SearchParams {
  query?: string
  filters?: Record<string, any>
}

export interface FormData {
  [key: string]: any
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface BreadcrumbItem {
  label: string
  path?: string
  current?: boolean
}

export interface NavigationItem {
  label: string
  path: string
  icon?: string
  children?: NavigationItem[]
}

export interface ErrorInfo {
  message: string
  code?: string
  field?: string
}

export interface LoadingState {
  isLoading: boolean
  error?: ErrorInfo | null
}

// Status types
export type EntityStatus = 'active' | 'inactive'
export type SiteStatus = 'active' | 'completed' | 'suspended'

// Common form validation errors
export interface ValidationErrors {
  [field: string]: string[]
}