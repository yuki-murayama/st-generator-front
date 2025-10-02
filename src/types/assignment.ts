import { BaseEntity, FormData } from './common'
import { Employee } from './employee'
import { Site } from './site'

// Assignment interface based on design document data model
export interface Assignment extends BaseEntity {
  employee_id: string        // 従業員ID（外部キー）
  site_id: string           // 現場ID（外部キー）
  start_date: Date          // 配属開始日
  end_date?: Date           // 配属終了日（オプション）
  role?: string | null      // 現場での役割（オプション）
  notes?: string | null     // 備考（オプション）

  // リレーション（取得時に含まれる場合）
  employee?: Employee       // 従業員情報
  site?: Site              // 現場情報
}

// Assignment form data interface for create/update operations
export interface AssignmentFormData extends Omit<FormData, 'id' | 'created_at' | 'updated_at'> {
  employee_id: string
  site_id: string
  start_date: string | Date  // Form might use string initially
  end_date?: string | Date
  role?: string
  notes?: string
}

// Assignment creation data (excludes id and timestamps)
export interface CreateAssignmentData {
  employee_id: string
  site_id: string
  start_date: string | Date  // Allow string input from forms
  end_date?: string | Date
  role?: string | null
  notes?: string | null
}

// Assignment update data (all fields optional except id)
export interface UpdateAssignmentData extends Partial<Omit<Assignment, 'id' | 'created_at' | 'updated_at' | 'employee' | 'site'>> {
  id: string
}

// Assignment search/filter parameters
export interface AssignmentSearchParams {
  query?: string             // Search in employee name, site name
  employee_id?: string       // Filter by employee
  site_id?: string          // Filter by site
  role?: string | null      // Filter by role
  start_date_from?: Date     // Filter by start date range
  start_date_to?: Date
  end_date_from?: Date       // Filter by end date range
  end_date_to?: Date
  active_only?: boolean      // Only active assignments (no end_date or end_date > now)
}

// Assignment with full employee and site information
export interface AssignmentWithDetails extends Assignment {
  employee: Employee
  site: Site
  duration?: AssignmentDuration
  status: AssignmentStatus
}

// Assignment list item for table display
export interface AssignmentListItem {
  id: string
  employee_id: string
  employee_name: string
  site_id: string
  site_name: string
  start_date: Date
  end_date?: Date
  role?: string
  status: AssignmentStatus
  duration: string           // Formatted duration display
}

// Assignment status
export type AssignmentStatus = 'active' | 'completed' | 'upcoming'

// Assignment duration information
export interface AssignmentDuration {
  days: number
  weeks: number
  months: number
  years: number
  formatted: string          // Human-readable format
  is_ongoing: boolean        // No end date specified
  is_completed: boolean      // End date has passed
}

// Assignment statistics for dashboard
export interface AssignmentStats {
  total: number
  active: number
  completed: number
  upcoming: number
  by_role: Record<string, number>
  average_duration?: number   // Average duration in days
  ending_soon: number        // Assignments ending in next 30 days
}

// Employee option for assignment form
export interface EmployeeOption {
  value: string              // employee_id
  label: string              // employee full name
  department: string
  position: string
  current_assignments?: number // Count of current assignments
  available: boolean         // Not assigned to selected site
}

// Site option for assignment form
export interface SiteOption {
  value: string              // site_id
  label: string              // site name
  location: string
  status: string
  assigned_count?: number    // Current assignment count
  capacity?: number          // Maximum capacity if defined
  available: boolean         // Has capacity for more assignments
}

// Role options for assignment form
export interface RoleOption {
  value: string
  label: string
  description?: string
  assignment_count?: number  // Number of assignments with this role
}

// Assignment conflict detection
export interface AssignmentConflict {
  type: 'duplicate' | 'overlap' | 'capacity'
  message: string
  conflicting_assignment?: Assignment
  suggestions?: string[]
}

// Assignment validation result
export interface AssignmentValidation {
  is_valid: boolean
  conflicts: AssignmentConflict[]
  warnings: string[]
}

// Assignment history item
export interface AssignmentHistory {
  assignment: Assignment
  employee_name: string
  site_name: string
  duration: AssignmentDuration
  status: AssignmentStatus
}

// Bulk assignment operations
export interface BulkAssignmentData {
  employee_ids: string[]
  site_id: string
  start_date: Date
  end_date?: Date
  role?: string
  notes?: string
}

export interface BulkAssignmentResult {
  successful: Assignment[]
  failed: Array<{
    employee_id: string
    error: string
  }>
}