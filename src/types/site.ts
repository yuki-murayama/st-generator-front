import { BaseEntity, SiteStatus, FormData } from './common'

// Site interface based on design document data model
export interface Site extends BaseEntity {
  name: string               // 現場名
  description?: string | null // 説明（オプション）
  location: string           // 所在地
  start_date: Date           // 開始日
  end_date?: Date            // 終了日（オプション）
  status: SiteStatus         // 現場状況 ('active' | 'completed' | 'suspended')
  manager_name?: string | null // 現場責任者名（オプション）
}

// Site form data interface for create/update operations
export interface SiteFormData extends Omit<FormData, 'id' | 'created_at' | 'updated_at'> {
  name: string
  description?: string
  location: string
  start_date: string | Date   // Form might use string initially
  end_date?: string | Date
  status: SiteStatus
  manager_name?: string
}

// Site creation data (excludes id and timestamps)
export interface CreateSiteData {
  name: string
  description?: string | null
  location: string
  start_date: string | Date  // Allow string input from forms
  end_date?: string | Date
  status: SiteStatus
  manager_name?: string | null
}

// Site update data (all fields optional except id)
export interface UpdateSiteData extends Partial<Omit<Site, 'id' | 'created_at' | 'updated_at'>> {
  id: string
}

// Site search/filter parameters
export interface SiteSearchParams {
  query?: string             // Search in name, location
  location?: string          // Filter by location
  status?: SiteStatus        // Filter by status
  manager_name?: string      // Filter by manager
  start_date_from?: Date     // Filter by start date range
  start_date_to?: Date
  end_date_from?: Date       // Filter by end date range
  end_date_to?: Date
}

// Site with assignment information
export interface SiteWithAssignments extends Site {
  assigned_employees?: SiteAssignmentInfo[]
  assignment_count?: number
}

// Assignment information for site view
export interface SiteAssignmentInfo {
  assignment_id: string
  employee_id: string
  employee_name: string
  start_date: Date
  end_date?: Date
  role?: string
  status: string
}

// Site statistics for dashboard
export interface SiteStats {
  total: number
  active: number
  completed: number
  suspended: number
  by_location: Record<string, number>
  average_duration?: number   // Average duration in days
  upcoming_deadlines: number  // Sites ending in next 30 days
}

// Site list item for table/card display
export interface SiteListItem {
  id: string
  name: string
  location: string
  status: SiteStatus
  start_date: Date
  end_date?: Date
  manager_name?: string
  assigned_count: number      // Number of assigned employees
  duration?: string           // Formatted duration display
  progress?: number           // Progress percentage (0-100)
}

// Site card display data
export interface SiteCardData {
  id: string
  name: string
  location: string
  status: SiteStatus
  start_date: Date
  end_date?: Date
  assigned_count: number
  progress?: number
  status_color: string        // Color for status indicator
  status_label: string        // Localized status label
}

// Location options for forms
export interface LocationOption {
  value: string
  label: string
  site_count?: number
}

// Site manager options for forms
export interface ManagerOption {
  value: string
  label: string
  site_count?: number
}

// Site duration information
export interface SiteDuration {
  days: number
  weeks: number
  months: number
  years: number
  formatted: string           // Human-readable format
}

// Site progress calculation
export interface SiteProgress {
  percentage: number          // 0-100
  days_elapsed: number
  days_remaining?: number
  is_overdue: boolean
  milestone?: string          // Current milestone
}