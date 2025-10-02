import { useAuthContext } from '../contexts/AuthContext'

/**
 * Custom hook for accessing authentication state and methods
 * Provides convenient access to auth context throughout the application
 */
export const useAuth = () => {
  return useAuthContext()
}

/**
 * Helper hook to check if user is authenticated
 * @returns boolean indicating if user is currently authenticated
 */
export const useIsAuthenticated = () => {
  const { user, loading } = useAuth()
  return { isAuthenticated: !!user && !loading, loading }
}

/**
 * Helper hook to get current user information
 * @returns user object or null if not authenticated
 */
export const useCurrentUser = () => {
  const { user } = useAuth()
  return user
}

/**
 * Helper hook for authentication status with loading state
 * Useful for components that need to handle authentication loading
 */
export const useAuthStatus = () => {
  const { user, loading, error } = useAuth()

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    hasError: !!error,
    error,
    user
  }
}