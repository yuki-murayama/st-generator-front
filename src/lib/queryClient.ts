import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // キャッシュ時間: 5分
      staleTime: 5 * 60 * 1000,
      // キャッシュ保持時間: 10分（React Query v5では gcTime に変更）
      gcTime: 10 * 60 * 1000,
      // バックグラウンドでの自動再フェッチを無効化
      refetchOnWindowFocus: false,
      // エラー時の自動リトライ設定
      retry: (failureCount, error: any) => {
        // 認証エラーの場合はリトライしない
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        // サーバーエラーの場合は最大2回リトライ
        return failureCount < 2
      },
      // リトライ間隔（指数バックオフ）
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      // ミューテーション失敗時のリトライ設定
      retry: (failureCount, error: any) => {
        // 認証エラーやクライアントエラーの場合はリトライしない
        if (error?.status === 401 || error?.status === 403 || error?.status < 500) {
          return false
        }
        // サーバーエラーの場合は最大1回リトライ
        return failureCount < 1
      }
    }
  }
})

// クエリキーファクトリー
export const queryKeys = {
  // 従業員関連
  employees: {
    all: ['employees'] as const,
    lists: () => [...queryKeys.employees.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.employees.lists(), params] as const,
    details: () => [...queryKeys.employees.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.employees.details(), id] as const
  },
  // 現場関連
  sites: {
    all: ['sites'] as const,
    lists: () => [...queryKeys.sites.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.sites.lists(), params] as const,
    details: () => [...queryKeys.sites.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sites.details(), id] as const
  },
  // 配属関連
  assignments: {
    all: ['assignments'] as const,
    lists: () => [...queryKeys.assignments.all, 'list'] as const,
    list: (params?: any) => [...queryKeys.assignments.lists(), params] as const,
    details: () => [...queryKeys.assignments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assignments.details(), id] as const,
    byEmployee: (employeeId: string) => [...queryKeys.assignments.all, 'by-employee', employeeId] as const,
    bySite: (siteId: string) => [...queryKeys.assignments.all, 'by-site', siteId] as const
  },
  // ダッシュボード統計
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    activity: () => [...queryKeys.dashboard.all, 'activity'] as const
  }
}