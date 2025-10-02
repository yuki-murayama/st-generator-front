import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { queryKeys } from '../../lib/queryClient'
import { generateMockResponse, getMockEmployeeDetail } from '../../lib/mockData'
import {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeSearchParams,
  EmployeeListItem,
  EmployeeWithAssignments
} from '../../types'

// 拡張されたパラメータ型
interface EmployeeQueryParams extends EmployeeSearchParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 従業員一覧の戻り値型
interface EmployeeListResponse {
  data: EmployeeListItem[]
  count: number
}

// 従業員一覧取得
export const useEmployees = (params?: EmployeeQueryParams) => {
  const searchParams = params || {}
  const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true'

  return useQuery({
    queryKey: queryKeys.employees.list(searchParams),
    queryFn: async (): Promise<EmployeeListResponse> => {
      // 開発環境またはSupabaseが設定されていない場合はモックデータを使用
      if (isDevelopment || import.meta.env.VITE_SUPABASE_URL === 'https://your-project-id.supabase.co') {
        console.log('Using mock data for employees')
        // モックデータの場合は少し遅延を追加して実際のAPIコールっぽくする
        await new Promise(resolve => setTimeout(resolve, 500))
        return generateMockResponse(searchParams)
      }

      // 実際のSupabase API呼び出し
      let query = supabase.from('employees').select('*', { count: 'exact' })

      // 検索条件の適用
      if (searchParams.query) {
        query = query.or(`first_name.ilike.%${searchParams.query}%,last_name.ilike.%${searchParams.query}%,email.ilike.%${searchParams.query}%`)
      }

      if (searchParams.department) {
        query = query.eq('department', searchParams.department)
      }

      if (searchParams.position) {
        query = query.eq('position', searchParams.position)
      }

      if (searchParams.status) {
        query = query.eq('status', searchParams.status)
      }

      if (searchParams.hire_date_from) {
        query = query.gte('hire_date', searchParams.hire_date_from.toISOString())
      }

      if (searchParams.hire_date_to) {
        query = query.lte('hire_date', searchParams.hire_date_to.toISOString())
      }

      // ソート設定
      const sortBy = searchParams.sortBy || 'created_at'
      const ascending = searchParams.sortOrder === 'asc'

      // ソートフィールドのマッピング（full_nameは名前の結合なので特別処理）
      if (sortBy === 'full_name') {
        query = query.order('last_name', { ascending })
        query = query.order('first_name', { ascending })
      } else {
        query = query.order(sortBy, { ascending })
      }

      // ページネーション設定
      if (searchParams.page !== undefined && searchParams.limit !== undefined) {
        const from = searchParams.page * searchParams.limit
        const to = from + searchParams.limit - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        throw new Error(error.message)
      }

      // EmployeeListItem形式に変換
      const employees = (data || []).map((employee: any): EmployeeListItem => ({
        id: employee.id,
        full_name: `${employee.last_name} ${employee.first_name}`,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        status: employee.status,
        current_site: undefined, // TODO: 配属情報から取得
        hire_date: new Date(employee.hire_date)
      }))

      return {
        data: employees,
        count: count || 0
      }
    }
  })
}

// 従業員詳細取得
export const useEmployee = (id: string) => {
  const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true'

  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: async (): Promise<EmployeeWithAssignments> => {
      // 開発環境またはSupabaseが設定されていない場合はモックデータを使用
      if (isDevelopment || import.meta.env.VITE_SUPABASE_URL === 'https://your-project-id.supabase.co') {
        console.log('Using mock data for employee detail:', id)
        // モックデータの場合は少し遅延を追加
        await new Promise(resolve => setTimeout(resolve, 500))

        const mockEmployee = getMockEmployeeDetail(id)
        if (!mockEmployee) {
          throw new Error('従業員が見つかりません')
        }

        return mockEmployee
      }

      // 実際のSupabase API呼び出し
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('従業員が見つかりません')
      }

      // 現在の配属情報と履歴を取得
      const { data: assignments, error: assignmentError } = await supabase
        .from('assignments')
        .select('*, sites(*)')
        .eq('employee_id', id)
        .order('start_date', { ascending: false })

      if (assignmentError) {
        console.warn('配属情報の取得に失敗しました:', assignmentError.message)
      }

      const currentAssignments = assignments?.filter(a => !a.end_date) || []
      const assignmentHistory = assignments?.filter(a => a.end_date) || []

      return {
        ...data,
        hire_date: new Date(data.hire_date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        current_assignments: currentAssignments.map(a => ({
          assignment_id: a.id,
          site_id: a.site_id,
          site_name: a.sites?.name || '',
          start_date: new Date(a.start_date),
          end_date: a.end_date ? new Date(a.end_date) : undefined,
          role: a.role || undefined,
          status: a.end_date ? 'completed' : 'active'
        })),
        assignment_history: assignmentHistory.map(a => ({
          assignment_id: a.id,
          site_id: a.site_id,
          site_name: a.sites?.name || '',
          start_date: new Date(a.start_date),
          end_date: a.end_date ? new Date(a.end_date) : undefined,
          role: a.role || undefined,
          status: 'completed'
        }))
      }
    },
    enabled: !!id
  })
}

// 従業員作成
export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (employeeData: CreateEmployeeData): Promise<Employee> => {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...employeeData,
          hire_date: typeof employeeData.hire_date === 'string'
            ? employeeData.hire_date
            : employeeData.hire_date.toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        ...data,
        hire_date: new Date(data.hire_date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      }
    },
    onSuccess: () => {
      // 従業員一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
      // ダッシュボード統計のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    }
  })
}

// 従業員更新
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updateData: UpdateEmployeeData): Promise<Employee> => {
      const { id, ...updates } = updateData

      const processedUpdates = {
        ...updates,
        hire_date: updates.hire_date
          ? (typeof updates.hire_date === 'string'
              ? updates.hire_date
              : updates.hire_date.toISOString())
          : undefined
      }

      const { data, error } = await supabase
        .from('employees')
        .update(processedUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        ...data,
        hire_date: new Date(data.hire_date),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      }
    },
    onSuccess: (updatedEmployee) => {
      // 従業員詳細のキャッシュを更新
      queryClient.setQueryData(
        queryKeys.employees.detail(updatedEmployee.id),
        updatedEmployee
      )
      // 従業員一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
    }
  })
}

// 従業員削除
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()
  const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true'

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // 開発環境またはSupabaseが設定されていない場合はモック処理
      if (isDevelopment || import.meta.env.VITE_SUPABASE_URL === 'https://your-project-id.supabase.co') {
        console.log('Mock delete employee:', id)
        // モックデータの場合は少し遅延を追加
        await new Promise(resolve => setTimeout(resolve, 300))
        return
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: (_, deletedId) => {
      // 従業員詳細のキャッシュを削除
      queryClient.removeQueries({ queryKey: queryKeys.employees.detail(deletedId) })
      // 従業員一覧のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
      // 配属情報のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.byEmployee(deletedId) })
      // ダッシュボード統計のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    }
  })
}

// 部署一覧取得（フィルター用）
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('employees')
        .select('department')

      if (error) {
        throw new Error(error.message)
      }

      // 重複を除去して部署一覧を作成
      const departments = [...new Set(data.map(emp => emp.department))]
      return departments.sort()
    },
    staleTime: 10 * 60 * 1000 // 10分間キャッシュ
  })
}

// 役職一覧取得（フィルター用）
export const usePositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('employees')
        .select('position')

      if (error) {
        throw new Error(error.message)
      }

      // 重複を除去して役職一覧を作成
      const positions = [...new Set(data.map(emp => emp.position))]
      return positions.sort()
    },
    staleTime: 10 * 60 * 1000 // 10分間キャッシュ
  })
}