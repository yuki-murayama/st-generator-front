import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/api/useEmployees'

// Mock Supabase
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockFrom = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase', () => {
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
                  single: mockSingle
                }
              },
              or: vi.fn().mockReturnThis(),
              gte: vi.fn().mockReturnThis(),
              lte: vi.fn().mockReturnThis(),
              order: vi.fn().mockReturnThis(),
              range: vi.fn().mockReturnThis()
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

describe('useEmployees', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns query result with proper structure', () => {
    const { result } = renderHook(() => useEmployees(), { wrapper })

    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isError')
  })
})

describe('useCreateEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns mutation with mutate function', () => {
    const { result } = renderHook(() => useCreateEmployee(), { wrapper })

    expect(result.current).toHaveProperty('mutate')
    expect(result.current).toHaveProperty('mutateAsync')
  })
})

describe('useUpdateEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns mutation with mutate function', () => {
    const { result } = renderHook(() => useUpdateEmployee(), { wrapper })

    expect(result.current).toHaveProperty('mutate')
    expect(result.current).toHaveProperty('mutateAsync')
  })
})

describe('useDeleteEmployee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns mutation with mutate function', () => {
    const { result } = renderHook(() => useDeleteEmployee(), { wrapper })

    expect(result.current).toHaveProperty('mutate')
    expect(result.current).toHaveProperty('mutateAsync')
  })
})