import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSites, useCreateSite, useUpdateSite, useDeleteSite } from './useSites'

// Mock Supabase
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockFrom = vi.fn()
const mockSingle = vi.fn()

vi.mock('../../lib/supabase', () => {
  return {
    auth: {
      getCurrentUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn()
    },
    supabase: {
      from: (...args: any[]) => {
        mockFrom(...args)
        return {
          select: (...args: any[]) => {
            mockSelect(...args)
            return {
              eq: (...args: any[]) => {
                mockEq(...args)
                return {
                  single: mockSingle,
                  is: vi.fn().mockReturnThis()
                }
              },
              or: vi.fn().mockReturnThis(),
              gte: vi.fn().mockReturnThis(),
              lte: vi.fn().mockReturnThis(),
              ilike: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              range: vi.fn().mockReturnThis(),
              is: vi.fn().mockReturnThis(),
              not: vi.fn().mockReturnThis()
            }
          },
          insert: (...args: any[]) => {
            mockInsert(...args)
            return {
              select: () => ({
                single: mockSingle
              })
            }
          },
          update: (...args: any[]) => {
            mockUpdate(...args)
            return {
              eq: (...args: any[]) => {
                mockEq(...args)
                return {
                  select: () => ({
                    single: mockSingle
                  })
                }
              }
            }
          },
          delete: () => ({
            eq: (...args: any[]) => {
              mockEq(...args)
              return Promise.resolve({ data: null, error: null })
            }
          })
        }
      }
    }
  }
})

// Mock environment for testing
vi.stubEnv('VITE_DEV_MODE', 'false')
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('useSites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns query result with proper structure', () => {
    const { result } = renderHook(() => useSites(), { wrapper })

    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isError')
  })
})

describe('useCreateSite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns mutation with mutate function', () => {
    const { result } = renderHook(() => useCreateSite(), { wrapper })

    expect(result.current).toHaveProperty('mutate')
    expect(result.current).toHaveProperty('mutateAsync')
  })
})

describe('useUpdateSite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns mutation with mutate function', () => {
    const { result } = renderHook(() => useUpdateSite(), { wrapper })

    expect(result.current).toHaveProperty('mutate')
    expect(result.current).toHaveProperty('mutateAsync')
  })
})

describe('useDeleteSite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns mutation with mutate function', () => {
    const { result } = renderHook(() => useDeleteSite(), { wrapper })

    expect(result.current).toHaveProperty('mutate')
    expect(result.current).toHaveProperty('mutateAsync')
  })
})