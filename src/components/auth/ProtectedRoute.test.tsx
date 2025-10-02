import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock functions
const mockGetCurrentUser = vi.fn()
const mockOnAuthStateChange = vi.fn()

// Mock Supabase auth module
vi.mock('../../lib/supabase', () => {
  return {
    auth: {
      getCurrentUser: () => mockGetCurrentUser(),
      onAuthStateChange: (callback: any) => {
        // Store callback but don't call it immediately to avoid loops
        mockOnAuthStateChange(callback)
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn()
            }
          }
        }
      },
      signIn: vi.fn(),
      signOut: vi.fn(),
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

const TestComponent = () => <div>Protected Content</div>

const renderWithProviders = (component: React.ReactElement, initialRoute = '/') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          {component}
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null
    })

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(await screen.findByText('Protected Content')).toBeInTheDocument()
  })

  it('shows loading state while checking authentication', () => {
    mockGetCurrentUser.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      '/dashboard'
    )

    // Should not render protected content
    await vi.waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })
})