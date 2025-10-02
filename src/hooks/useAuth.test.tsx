import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { AuthProvider } from '../contexts/AuthContext'

const mockGetCurrentUser = vi.fn()
const mockSignIn = vi.fn()
const mockSignOut = vi.fn()
const mockOnAuthStateChange = vi.fn()

vi.mock('../lib/supabase', () => {
  return {
    auth: {
      getCurrentUser: () => mockGetCurrentUser(),
      onAuthStateChange: (callback: any) => {
        mockOnAuthStateChange(callback)
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn()
            }
          }
        }
      },
      signIn: (email: string, password: string) => mockSignIn(email, password),
      signOut: () => mockSignOut(),
      signUp: vi.fn()
    }
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {children}
    </AuthProvider>
  </QueryClientProvider>
)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue({
      data: { user: null },
      error: null
    })
  })

  it('returns auth context with user and methods', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('signIn')
    expect(result.current).toHaveProperty('signOut')
  })

  it('login calls signIn with correct credentials', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.signIn({ email: 'test@example.com', password: 'password' })

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password')
  })

  it('logout calls signOut', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.signOut()

    expect(mockSignOut).toHaveBeenCalled()
  })
})