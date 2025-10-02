import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from './useAssignments'

// Mock Supabase
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockFrom = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockIs = vi.fn()
const mockGte = vi.fn()
const mockLte = vi.fn()
const mockIlike = vi.fn()

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
                  is: mockIs,
                  order: mockOrder
                }
              },
              is: (...args: any[]) => {
                mockIs(...args)
                return {
                  order: mockOrder
                }
              },
              gte: (...args: any[]) => {
                mockGte(...args)
                return {
                  lte: mockLte,
                  is: mockIs,
                  order: mockOrder
                }
              },
              lte: (...args: any[]) => {
                mockLte(...args)
                return {
                  gte: mockGte,
                  is: mockIs,
                  order: mockOrder
                }
              },
              ilike: (...args: any[]) => {
                mockIlike(...args)
                return {
                  is: mockIs,
                  order: mockOrder
                }
              },
              order: mockOrder
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

describe('useAssignments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns query result with proper structure', () => {
    const { result } = renderHook(() => useAssignments(), { wrapper })

    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isError')
  })
})

describe('useCreateAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns mutation with mutate function', () => {
    const { result } = renderHook(() => useCreateAssignment(), { wrapper })

    expect(result.current).toHaveProperty('mutate')
    expect(result.current).toHaveProperty('mutateAsync')
  })
})

describe('useUpdateAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns mutation with mutate function', () => {
    const { result } = renderHook(() => useUpdateAssignment(), { wrapper })

    expect(result.current).toHaveProperty('mutate')
    expect(result.current).toHaveProperty('mutateAsync')
  })
})

describe('useDeleteAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  it('returns mutation with mutate function', () => {
    const { result } = renderHook(() => useDeleteAssignment(), { wrapper })

    expect(result.current).toHaveProperty('mutate')
    expect(result.current).toHaveProperty('mutateAsync')
  })
})