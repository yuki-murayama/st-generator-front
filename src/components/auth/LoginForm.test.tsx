import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginForm from './LoginForm'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock functions
const mockGetCurrentUser = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockSignIn = vi.fn()

// Mock Supabase auth module
vi.mock('../../lib/supabase', () => {
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

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue({
      data: { user: null },
      error: null
    })
  })

  it('renders login form with email and password fields', async () => {
    renderWithProviders(<LoginForm />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /メールアドレス/i })).toBeInTheDocument()
    })

    expect(screen.getAllByLabelText(/パスワード/i)[0]).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument()
  })

  it('calls signIn when form is submitted with valid data', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null
    })

    renderWithProviders(<LoginForm />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /メールアドレス/i })).toBeInTheDocument()
    })

    const emailInput = screen.getByRole('textbox', { name: /メールアドレス/i })
    const passwordInput = screen.getAllByLabelText(/パスワード/i)[0]
    const submitButton = screen.getByRole('button', { name: /ログイン/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows password when visibility toggle is clicked', async () => {
    renderWithProviders(<LoginForm />)

    await waitFor(() => {
      expect(screen.getAllByLabelText(/パスワード/i)[0]).toBeInTheDocument()
    })

    const passwordInput = screen.getAllByLabelText(/パスワード/i)[0] as HTMLInputElement
    const toggleButtons = screen.getAllByRole('button')
    const toggleButton = toggleButtons.find(btn => btn.getAttribute('aria-label')?.includes('パスワード'))

    expect(passwordInput.type).toBe('password')

    if (toggleButton) {
      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('text')
    }
  })
})