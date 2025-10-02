import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuthStatus } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * Protected route component that handles authentication-based access control
 * Redirects to login page if user is not authenticated
 * Shows loading spinner while authentication status is being determined
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  fallback
}) => {
  const location = useLocation()
  const { isAuthenticated, isLoading, hasError, error } = useAuthStatus()

  // Skip authentication check in test/dev mode if VITE_SKIP_AUTH is enabled
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true'
  if (skipAuth) {
    return <>{children}</>
  }

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      fallback || (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2
          }}
        >
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            認証状態を確認中...
          </Typography>
        </Box>
      )
    )
  }

  // Show error state if authentication check failed
  if (hasError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          padding: 2
        }}
      >
        <Typography variant="h6" color="error">
          認証エラーが発生しました
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {error || 'ページを表示できません。再度ログインしてください。'}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Navigate to={redirectTo} state={{ from: location }} replace />
        </Box>
      </Box>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}

export default ProtectedRoute