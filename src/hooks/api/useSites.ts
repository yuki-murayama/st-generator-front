import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { queryKeys } from '../../lib/queryClient'
import { generateMockSiteResponse, getMockSiteDetail, generateMockSiteCards } from '../../lib/mockData'
import {
  Site,
  CreateSiteData,
  UpdateSiteData,
  SiteSearchParams,
  SiteWithAssignments,
  SiteListItem,
  SiteCardData
} from '../../types'

// 現場一覧取得
export const useSites = (searchParams?: SiteSearchParams) => {
  const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true'

  return useQuery({
    queryKey: queryKeys.sites.list(searchParams),
    queryFn: async (): Promise<SiteListItem[]> => {
      // 開発環境またはSupabaseが設定されていない場合はモックデータを使用
      if (isDevelopment || import.meta.env.VITE_SUPABASE_URL === 'https://your-project-id.supabase.co') {
        console.log('Using mock data for sites')
        // モックデータの場合は少し遅延を追加して実際のAPIコールっぽくする
        await new Promise(resolve => setTimeout(resolve, 500))
        return generateMockSiteResponse(searchParams)
      }

      let query = supabase.from('sites').select('*')

      // 検索条件の適用
      if (searchParams?.query) {
        query = query.or(`name.ilike.%${searchParams.query}%,location.ilike.%${searchParams.query}%`)
      }

      if (searchParams?.location) {
        query = query.eq('location', searchParams.location)
      }

      if (searchParams?.status) {
        query = query.eq('status', searchParams.status)
      }

      if (searchParams?.manager_name) {
        query = query.ilike('manager_name', `%${searchParams.manager_name}%`)
      }

      if (searchParams?.start_date_from) {
        query = query.gte('start_date', searchParams.start_date_from.toISOString())
      }

      if (searchParams?.start_date_to) {
        query = query.lte('start_date', searchParams.start_date_to.toISOString())
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      // 各現場の配属数を取得
      const sitesWithCounts = await Promise.all(
        (data || []).map(async (site: any): Promise<SiteListItem> => {
          const { data: assignments, error: assignmentError } = await supabase
            .from('assignments')
            .select('id')
            .eq('site_id', site.id)
            .is('end_date', null) // 現在の配属のみ

          const assignedCount = assignmentError ? 0 : (assignments?.length || 0)

          // 進捗計算
          let progress: number | undefined
          if (site.start_date && site.end_date) {
            const startDate = new Date(site.start_date)
            const endDate = new Date(site.end_date)
            const now = new Date()

            if (now >= startDate && now <= endDate) {
              const totalDuration = endDate.getTime() - startDate.getTime()
              const elapsedDuration = now.getTime() - startDate.getTime()
              progress = Math.round((elapsedDuration / totalDuration) * 100)
            } else if (now > endDate) {
              progress = 100
            }
          }

          // 期間計算
          let duration: string | undefined
          if (site.start_date && site.end_date) {
            const startDate = new Date(site.start_date)
            const endDate = new Date(site.end_date)
            const diffTime = endDate.getTime() - startDate.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            duration = `${diffDays}日間`
          }

          return {
            id: site.id,
            name: site.name,
            location: site.location,
            status: site.status,
            start_date: new Date(site.start_date),
            end_date: site.end_date ? new Date(site.end_date) : undefined,
            manager_name: site.manager_name || undefined,
            assigned_count: assignedCount,
            duration,
            progress
          }
        })
      )

      return sitesWithCounts
    }
  })
}

// 現場詳細取得
export const useSite = (id: string) => {
  const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true'

  return useQuery({
    queryKey: queryKeys.sites.detail(id),
    queryFn: async (): Promise<SiteWithAssignments> => {
      // 開発環境またはSupabaseが設定されていない場合はモックデータを使用
      if (isDevelopment || import.meta.env.VITE_SUPABASE_URL === 'https://your-project-id.supabase.co') {
        console.log('Using mock data for site detail')
        await new Promise(resolve => setTimeout(resolve, 300))
        const mockSite = getMockSiteDetail(id)
        if (!mockSite) {
          throw new Error('現場が見つかりません')
        }
        return mockSite
      }

      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('現場が見つかりません')
      }

      // 配属情報を取得
      const { data: assignments, error: assignmentError } = await supabase
        .from('assignments')
        .select('*, employees(*)')
        .eq('site_id', id)
        .order('start_date', { ascending: false })

      if (assignmentError) {
        console.warn('配属情報の取得に失敗しました:', assignmentError.message)
      }

      const assigned_employees = assignments?.map(a => ({
        assignment_id: a.id,
        employee_id: a.employee_id,
        employee_name: `${a.employees?.last_name} ${a.employees?.first_name}`,
        start_date: new Date(a.start_date),
        end_date: a.end_date ? new Date(a.end_date) : undefined,
        role: a.role || undefined,
        status: a.end_date ? 'completed' : 'active'
      })) || []

      return {
        ...data,
        start_date: new Date(data.start_date),
        end_date: data.end_date ? new Date(data.end_date) : undefined,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        assigned_employees,
        assignment_count: assigned_employees.length
      }
    },
    enabled: !!id
  })
}

// 現場カード表示用データ取得
export const useSiteCards = (searchParams?: SiteSearchParams) => {
  const isDevelopment = import.meta.env.VITE_DEV_MODE === 'true'

  return useQuery({
    queryKey: [...queryKeys.sites.list(searchParams), 'cards'],
    queryFn: async (): Promise<SiteCardData[]> => {
      // 開発環境またはSupabaseが設定されていない場合はモックデータを使用
      if (isDevelopment || import.meta.env.VITE_SUPABASE_URL === 'https://your-project-id.supabase.co') {
        console.log('Using mock data for site cards')
        await new Promise(resolve => setTimeout(resolve, 400))
        return generateMockSiteCards(searchParams)
      }

      // Get sites data directly instead of calling useSites hook
      let query = supabase.from('sites').select('*')

      // Apply search filters
      if (searchParams?.query) {
        query = query.or(`name.ilike.%${searchParams.query}%,location.ilike.%${searchParams.query}%`)
      }

      if (searchParams?.location) {
        query = query.eq('location', searchParams.location)
      }

      if (searchParams?.status) {
        query = query.eq('status', searchParams.status)
      }

      if (searchParams?.manager_name) {
        query = query.ilike('manager_name', `%${searchParams.manager_name}%`)
      }

      if (searchParams?.start_date_from) {
        query = query.gte('start_date', searchParams.start_date_from.toISOString())
      }

      if (searchParams?.start_date_to) {
        query = query.lte('start_date', searchParams.start_date_to.toISOString())
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      // Get assignment counts for each site
      const sites = await Promise.all(
        (data || []).map(async (site: any): Promise<SiteListItem> => {
          const { data: assignments, error: assignmentError } = await supabase
            .from('assignments')
            .select('id')
            .eq('site_id', site.id)
            .is('end_date', null)

          const assignedCount = assignmentError ? 0 : (assignments?.length || 0)

          let progress: number | undefined
          if (site.start_date && site.end_date) {
            const startDate = new Date(site.start_date)
            const endDate = new Date(site.end_date)
            const now = new Date()

            if (now >= startDate && now <= endDate) {
              const totalDuration = endDate.getTime() - startDate.getTime()
              const elapsedDuration = now.getTime() - startDate.getTime()
              progress = Math.round((elapsedDuration / totalDuration) * 100)
            } else if (now > endDate) {
              progress = 100
            }
          }

          let duration: string | undefined
          if (site.start_date && site.end_date) {
            const startDate = new Date(site.start_date)
            const endDate = new Date(site.end_date)
            const diffTime = endDate.getTime() - startDate.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            duration = `${diffDays}日間`
          }

          return {
            id: site.id,
            name: site.name,
            location: site.location,
            status: site.status,
            start_date: new Date(site.start_date),
            end_date: site.end_date ? new Date(site.end_date) : undefined,
            manager_name: site.manager_name || undefined,
            assigned_count: assignedCount,
            duration,
            progress
          }
        })
      )

      return sites.map((site): SiteCardData => {
        let statusColor: string
        let statusLabel: string

        switch (site.status) {
          case 'active':
            statusColor = '#4caf50'
            statusLabel = '稼働中'
            break
          case 'completed':
            statusColor = '#9e9e9e'
            statusLabel = '完了'
            break
          case 'suspended':
            statusColor = '#ff9800'
            statusLabel = '中断'
            break
          default:
            statusColor = '#666'
            statusLabel = '不明'
        }

        return {
          ...site,
          status_color: statusColor,
          status_label: statusLabel
        }
      })
    }
  })
}

// 現場作成
export const useCreateSite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (siteData: CreateSiteData): Promise<Site> => {
      const { data, error } = await supabase
        .from('sites')
        .insert({
          ...siteData,
          start_date: typeof siteData.start_date === 'string'
            ? siteData.start_date
            : siteData.start_date.toISOString(),
          end_date: siteData.end_date
            ? (typeof siteData.end_date === 'string'
                ? siteData.end_date
                : siteData.end_date.toISOString())
            : null
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
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    }
  })
}

// 現場更新
export const useUpdateSite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updateData: UpdateSiteData): Promise<Site> => {
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
        .from('sites')
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
    onSuccess: (updatedSite) => {
      queryClient.setQueryData(
        queryKeys.sites.detail(updatedSite.id),
        updatedSite
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.lists() })
    }
  })
}

// 現場削除
export const useDeleteSite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.sites.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.bySite(deletedId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
    }
  })
}

// 地域一覧取得（フィルター用）
export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('sites')
        .select('location')

      if (error) {
        throw new Error(error.message)
      }

      const locations = [...new Set(data.map(site => site.location))]
      return locations.sort()
    },
    staleTime: 10 * 60 * 1000
  })
}

// 責任者一覧取得（フィルター用）
export const useManagers = () => {
  return useQuery({
    queryKey: ['managers'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('sites')
        .select('manager_name')
        .not('manager_name', 'is', null)

      if (error) {
        throw new Error(error.message)
      }

      const managers = [...new Set(data.map((site: any) => site.manager_name).filter(Boolean) as string[])]
      return managers.sort()
    },
    staleTime: 10 * 60 * 1000
  })
}