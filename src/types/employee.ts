import { BaseEntity, EntityStatus, FormData } from './common'

// Employee interface based on design document data model
export interface Employee extends BaseEntity {
  first_name: string         // 名前
  last_name: string          // 姓
  email: string              // メールアドレス（ユニーク）
  phone?: string | null      // 電話番号（オプション）
  department: string         // 部署
  position: string           // 役職
  hire_date: Date            // 入社日
  status: EntityStatus       // 在籍状況 ('active' | 'inactive')
}

// Employee form data interface for create/update operations
export interface EmployeeFormData extends Omit<FormData, 'id' | 'created_at' | 'updated_at'> {
  first_name: string
  last_name: string
  email: string
  phone?: string
  department: string
  position: string
  hire_date: string | Date   // Form might use string initially
  status: EntityStatus
}

// Employee creation data (excludes id and timestamps)
export interface CreateEmployeeData {
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  department: string
  position: string
  hire_date: string | Date   // Allow string input from forms
  status: EntityStatus
}

// Employee update data (all fields optional except id)
export interface UpdateEmployeeData extends Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>> {
  id: string
}

// Employee search/filter parameters
export interface EmployeeSearchParams {
  query?: string             // Search in name, email
  department?: string        // Filter by department
  position?: string          // Filter by position
  status?: EntityStatus      // Filter by status
  hire_date_from?: Date      // Filter by hire date range
  hire_date_to?: Date
}

// Employee with assignment information
export interface EmployeeWithAssignments extends Employee {
  current_assignments?: EmployeeAssignmentInfo[]
  assignment_history?: EmployeeAssignmentInfo[]
}

// Assignment information for employee view
export interface EmployeeAssignmentInfo {
  assignment_id: string
  site_id: string
  site_name: string
  start_date: Date
  end_date?: Date
  role?: string
  status: string
}

// Employee statistics for dashboard
export interface EmployeeStats {
  total: number
  active: number
  inactive: number
  by_department: Record<string, number>
  by_position: Record<string, number>
  recent_hires: number        // Hired in last 30 days
}

// Employee list item for table display
export interface EmployeeListItem {
  id: string
  full_name: string          // Combined first_name + last_name
  email: string
  department: string
  position: string
  status: EntityStatus
  current_site?: string      // Current assignment site name
  hire_date: Date
}

// Department and position options for forms
export interface DepartmentOption {
  value: string
  label: string
  employee_count?: number
}

export interface PositionOption {
  value: string
  label: string
  department?: string
  employee_count?: number
}