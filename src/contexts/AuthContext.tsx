import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types'
import { auth } from '../lib/supabase'

interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<{ error: any }>
  signUp: (credentials: RegisterCredentials) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    let mounted = true
    let initialized = false

    // Get initial user
    const initializeAuth = async () => {
      try {
        const { data, error: userError } = await auth.getCurrentUser()
        if (!mounted) return

        if (userError) {
          console.error('Error getting current user:', userError)
          // Don't set error for AuthSessionMissingError - it's expected when not logged in
          const errorMsg = userError.message || String(userError)
          if (!errorMsg.includes('AuthSessionMissingError') && !errorMsg.includes('Auth session missing')) {
            setError(errorMsg)
          }
          setUser(null)
        } else if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            user_metadata: data.user.user_metadata
          })
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        if (mounted) {
          setError('Failed to initialize authentication')
          setUser(null)
        }
      } finally {
        initialized = true
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((user) => {
      if (!mounted) return

      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          user_metadata: user.user_metadata
        })
      } else {
        setUser(null)
      }

      // Only set loading to false if initialization is complete
      if (initialized) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await auth.signIn(credentials.email, credentials.password)

      if (signInError) {
        setError(signInError.message)
        return { error: signInError }
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata
        })
      }

      return { error: null }
    } catch {
      const errorMessage = 'ログインに失敗しました'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (credentials: RegisterCredentials) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: signUpError } = await auth.signUp(
        credentials.email,
        credentials.password,
        {
          first_name: credentials.first_name,
          last_name: credentials.last_name
        }
      )

      if (signUpError) {
        setError(signUpError.message)
        return { error: signUpError }
      }

      // Note: User might need to confirm email before they can sign in
      if (data.user && data.user.email_confirmed_at) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata
        })
      }

      return { error: null }
    } catch {
      const errorMessage = '登録に失敗しました'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: signOutError } = await auth.signOut()

      if (signOutError) {
        setError(signOutError.message)
        return { error: signOutError }
      }

      setUser(null)
      return { error: null }
    } catch {
      const errorMessage = 'ログアウトに失敗しました'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}