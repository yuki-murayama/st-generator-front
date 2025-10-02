import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { queryKeys } from '../../lib/queryClient'
import { generateMockAssignmentResponse } from '../../lib/mockData'
import {
  Assignment,
  CreateAssignmentData,
  UpdateAssignmentData,
  AssignmentSearchParams,
  AssignmentWithDetails,
  AssignmentListItem,
  AssignmentValidation,
  EmployeeOption,
  SiteOption
} from '../../types'

// 配属一覧取得
export const useAssignments = (searchParams?: AssignmentSearchParams) => {
  const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true'

  return useQuery({
    queryKey: queryKeys.assignments.list(searchParams),
    queryFn: async (): Promise<AssignmentListItem[]> => {
      // 開発環境またはSupabaseが設定されていない場合はモックデータを使用
      if (isDevelopment || import.meta.env.VITE_SUPABASE_URL === 'https://your-project-id.supabase.co') {
        console.log('Using mock data for assignments')
        // モックデータの場合は少し遅延を追加して実際のAPIコールっぽくする
        await new Promise(resolve => setTimeout(resolve, 500))
        return generateMockAssignmentResponse(searchParams)
      }

      let query = supabase
        .from('assignments')
        .select('*, employees(*), sites(*)')

      if (searchParams?.employee_id) {
        query = query.eq('employee_id', searchParams.employee_id)
      }

      if (searchParams?.site_id) {
        query = query.eq('site_id', searchParams.site_id)
      }

      if (searchParams?.role) {
        query = query.ilike('role', `%${searchParams.role}%`)
      }

      if (searchParams?.start_date_from) {
        query = query.gte('start_date', searchParams.start_date_from.toISOString())
      }

      if (searchParams?.start_date_to) {
        query = query.lte('start_date', searchParams.start_date_to.toISOString())
      }

      if (searchParams?.end_date_from) {
        query = query.gte('end_date', searchParams.end_date_from.toISOString())
      }

      if (searchParams?.end_date_to) {
        query = query.lte('end_date', searchParams.end_date_to.toISOString())
      }

      // 現在活動中のプロジェクトのみ（デフォルト）
      if (searchParams?.active_only !== false) {
        query = query.is('end_date', null)
      }

      const { data, error } = await query.order('start_date', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      // AssignmentListItem形式に変換
      let assignments = (data || []).map((assignment: any) => {
        const employeeName = assignment.employees
          ? `${assignment.employees.last_name} ${assignment.employees.first_name}`
          : '不明'
        const siteName = assignment.sites?.name || '不明'

        // ステータス判定
        let status: 'active' | 'completed' | 'upcoming'
        const now = new Date()
        const startDate = new Date(assignment.start_date)
        const endDate = assignment.end_date ? new Date(assignment.end_date) : undefined

        if (endDate && now > endDate) {
          status = 'completed'
        } else if (now < startDate) {
          status = 'upcoming'
        } else {
          status = 'active'
        }

        // 期間表示の生成
        let duration: string
        if (endDate) {
          const diffTime = endDate.getTime() - startDate.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          duration = `${diffDays}日間`
        } else {
          const diffTime = now.getTime() - startDate.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          duration = `${diffDays}日経過`
        }

        return {
          id: assignment.id,
          employee_id: assignment.employee_id,
          employee_name: employeeName,
          site_id: assignment.site_id,
          site_name: siteName,
          start_date: startDate,
          end_date: endDate,
          role: assignment.role || undefined,
          status,
          duration
        }
      })

      // クエリでのフィルタリング
      if (searchParams?.query) {
        const query = searchParams.query.toLowerCase()
        assignments = assignments.filter(assignment =>
          assignment.employee_name.toLowerCase().includes(query) ||
          assignment.site_name.toLowerCase().includes(query)
        )
      }

      return assignments
    }
  })
}

// 配属詳細取得
export const useAssignment = (id: string) => {
  return useQuery({
    queryKey: queryKeys.assignments.detail(id),
    queryFn: async (): Promise<AssignmentWithDetails> => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*, employees(*), sites(*)')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('配属が見つかりません')
      }

      // 従業員と現場の詳細情報を取得
      const [employeeResult, siteResult] = await Promise.all([
        supabase.from('employees').select('*').eq('id', data.employee_id).single(),
        supabase.from('sites').select('*').eq('id', data.site_id).single()
      ])

      if (employeeResult.error || !employeeResult.data) {
        throw new Error('従業員情報の取得に失敗しました')
      }

      if (siteResult.error || !siteResult.data) {
        throw new Error('現場情報の取得に失敗しました')
      }

      // ステータスと期間計算
      const now = new Date()
      const startDate = new Date(data.start_date)
      const endDate = data.end_date ? new Date(data.end_date) : undefined

      let status: 'active' | 'completed' | 'upcoming'
      if (endDate && now > endDate) {
        status = 'completed'
      } else if (now < startDate) {
        status = 'upcoming'
      } else {
        status = 'active'
      }

      // 期間計算
      const duration = calculateDuration(startDate, endDate)

      return {
        ...data,
        start_date: startDate,
        end_date: endDate,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        employee: {
          ...employeeResult.data,
          hire_date: new Date(employeeResult.data.hire_date),
          created_at: new Date(employeeResult.data.created_at),
          updated_at: new Date(employeeResult.data.updated_at)
        },
        site: {
          ...siteResult.data,
          start_date: new Date(siteResult.data.start_date),
          end_date: siteResult.data.end_date ? new Date(siteResult.data.end_date) : undefined,
          created_at: new Date(siteResult.data.created_at),
          updated_at: new Date(siteResult.data.updated_at)
        },
        duration: { formatted: duration, days: 0, weeks: 0, months: 0, years: 0, is_ongoing: !endDate, is_completed: endDate ? now > endDate : false },
        status
      }
    },
    enabled: !!id
  })
}

// 配属作成
export const useCreateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (assignmentData: CreateAssignmentData): Promise<Assignment> => {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          employee_id: assignmentData.employee_id,
          site_id: assignmentData.site_id,
          start_date: typeof assignmentData.start_date === 'string'
            ? assignmentData.start_date
            : assignmentData.start_date.toISOString(),
          end_date: assignmentData.end_date
            ? (typeof assignmentData.end_date === 'string'
                ? assignmentData.end_date
                : assignmentData.end_date.toISOString())
            : null,
          role: assignmentData.role || null,
          notes: assignmentData.notes || null
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        ...data,
        start_date: new Date(data.start_date),
        end_date: data.end_date ? new Date(data.end_date) : undefined,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    }
  })
}

// 配属更新
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updateData: UpdateAssignmentData): Promise<Assignment> => {
      const { id, ...updates } = updateData

      const processedUpdates = {
        ...updates,
        start_date: updates.start_date
          ? (typeof updates.start_date === 'string'
              ? updates.start_date
              : updates.start_date.toISOString())
          : undefined,
        end_date: updates.end_date
          ? (typeof updates.end_date === 'string'
              ? updates.end_date
              : updates.end_date.toISOString())
          : undefined
      }

      const { data, error } = await supabase
        .from('assignments')
        .update(processedUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        ...data,
        start_date: new Date(data.start_date),
        end_date: data.end_date ? new Date(data.end_date) : undefined,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      }
    },
    onSuccess: (updatedAssignment) => {
      queryClient.setQueryData(
        queryKeys.assignments.detail(updatedAssignment.id),
        updatedAssignment
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.lists() })
    }
  })
}

// 配属削除
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.assignments.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    }
  })
}

// 従業員オプション取得（配属フォーム用）
export const useEmployeeOptions = (searchParams?: { available_only?: boolean; site_id?: string }) => {
  return useQuery({
    queryKey: ['employee-options', searchParams],
    queryFn: async (): Promise<EmployeeOption[]> => {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')

      if (error) {
        throw new Error(error.message)
      }

      const employeeOptions = await Promise.all(
        employees.map(async (employee: any): Promise<EmployeeOption> => {
          // 現在の配属数を取得
          const { data: assignments } = await supabase
            .from('assignments')
            .select('id')
            .eq('employee_id', employee.id)
            .is('end_date', null)

          // 選択された現場への配属がないかチェック
          let availableForSite = true
          if (searchParams?.site_id) {
            const { data: existingAssignment } = await supabase
              .from('assignments')
              .select('id')
              .eq('employee_id', employee.id)
              .eq('site_id', searchParams.site_id)
              .is('end_date', null)
              .single()

            availableForSite = !existingAssignment
          }

          return {
            value: employee.id,
            label: `${employee.last_name} ${employee.first_name}`,
            department: employee.department,
            position: employee.position,
            current_assignments: assignments?.length || 0,
            available: availableForSite
          }
        })
      )

      // available_onlyが指定されている場合、利用可能な従業員のみ返す
      if (searchParams?.available_only) {
        return employeeOptions.filter(option => option.available)
      }

      return employeeOptions
    },
    staleTime: 5 * 60 * 1000 // 5分間キャッシュ
  })
}

// 現場オプション取得（配属フォーム用）
export const useSiteOptions = (searchParams?: { available_only?: boolean }) => {
  return useQuery({
    queryKey: ['site-options', searchParams],
    queryFn: async (): Promise<SiteOption[]> => {
      const { data: sites, error } = await supabase
        .from('sites')
        .select('*')
        .eq('status', 'active')

      if (error) {
        throw new Error(error.message)
      }

      const siteOptions = await Promise.all(
        sites.map(async (site: any): Promise<SiteOption> => {
          // 現在の配属数を取得
          const { data: assignments } = await supabase
            .from('assignments')
            .select('id')
            .eq('site_id', site.id)
            .is('end_date', null)

          return {
            value: site.id,
            label: site.name,
            location: site.location,
            status: site.status,
            assigned_count: assignments?.length || 0,
            available: true // すべての現場が利用可能と仮定
          }
        })
      )

      return siteOptions
    },
    staleTime: 5 * 60 * 1000 // 5分間キャッシュ
  })
}

// 配属バリデーション
export const useValidateAssignment = () => {
  return useMutation({
    mutationFn: async (assignmentData: CreateAssignmentData): Promise<AssignmentValidation> => {
      const conflicts: any[] = []
      const warnings: string[] = []

      // 重複チェック
      const { data: existingAssignments } = await supabase
        .from('assignments')
        .select('*')
        .eq('employee_id', assignmentData.employee_id)
        .eq('site_id', assignmentData.site_id)

      if (existingAssignments && existingAssignments.length > 0) {
        const activeAssignment = existingAssignments.find(a => !a.end_date)
        if (activeAssignment) {
          conflicts.push({
            type: 'duplicate' as const,
            message: 'この従業員は既にこの現場に配属されています',
            conflicting_assignment: activeAssignment
          })
        }
      }

      // 重複期間チェック
      const startDate = new Date(assignmentData.start_date)
      const endDate = assignmentData.end_date ? new Date(assignmentData.end_date) : null

      const { data: overlappingAssignments } = await supabase
        .from('assignments')
        .select('*, sites(*)')
        .eq('employee_id', assignmentData.employee_id)
        .neq('site_id', assignmentData.site_id)

      if (overlappingAssignments) {
        for (const assignment of overlappingAssignments) {
          const assignmentStart = new Date(assignment.start_date)
          const assignmentEnd = assignment.end_date ? new Date(assignment.end_date) : null

          // 期間重複チェック
          const hasOverlap =
            (startDate <= assignmentStart && (!endDate || endDate >= assignmentStart)) ||
            (startDate <= (assignmentEnd || new Date()) && (!endDate || endDate >= (assignmentEnd || new Date()))) ||
            (startDate >= assignmentStart && (!assignmentEnd || startDate <= assignmentEnd))

          if (hasOverlap) {
            conflicts.push({
              type: 'overlap' as const,
              message: `配属期間が重複しています: ${assignment.sites?.name}`,
              conflicting_assignment: assignment
            })
          }
        }
      }

      return {
        is_valid: conflicts.length === 0,
        conflicts,
        warnings
      }
    }
  })
}

// 期間計算のヘルパー関数
function calculateDuration(startDate: Date, endDate: Date | null | undefined) {
  const now = new Date()
  const end = endDate || now

  const diffTime = end.getTime() - startDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 30) {
    return `${diffDays}日間`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    const remainingDays = diffDays % 30
    return remainingDays > 0 ? `${months}ヶ月${remainingDays}日` : `${months}ヶ月`
  } else {
    const years = Math.floor(diffDays / 365)
    const remainingDays = diffDays % 365
    const months = Math.floor(remainingDays / 30)
    if (months > 0) {
      return `${years}年${months}ヶ月`
    } else {
      return `${years}年`
    }
  }
}