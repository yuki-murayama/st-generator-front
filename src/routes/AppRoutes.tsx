import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import MainLayout from '../components/layout/MainLayout'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { EmployeeListPage } from '../pages/employees/EmployeeListPage'
import { EmployeeDetailPage } from '../pages/employees/EmployeeDetailPage'
import { EmployeeFormPage } from '../pages/employees/EmployeeFormPage'
import { SiteListPage } from '../pages/sites/SiteListPage'
import { SiteDetailPage } from '../pages/sites/SiteDetailPage'
import { SiteFormPage } from '../pages/sites/SiteFormPage'
import { AssignmentManagementPage } from '../pages/assignments/AssignmentManagementPage'
import { ProfilePage } from '../pages/ProfilePage'

/**
 * Application routes configuration
 * Implements comprehensive routing with authentication guards
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes with MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard as default route */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Employee Management Routes */}
        <Route path="employees">
          <Route index element={<EmployeeListPage />} />
          <Route path="new" element={<EmployeeFormPage />} />
          <Route path=":id" element={<EmployeeDetailPage />} />
          <Route path=":id/edit" element={<EmployeeFormPage />} />
        </Route>

        {/* Site Management Routes */}
        <Route path="sites">
          <Route index element={<SiteListPage />} />
          <Route path="new" element={<SiteFormPage />} />
          <Route path=":id" element={<SiteDetailPage />} />
          <Route path=":id/edit" element={<SiteFormPage />} />
        </Route>

        {/* Assignment Management Route */}
        <Route path="assignments" element={<AssignmentManagementPage />} />

        {/* Profile Route */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
            <Box textAlign="center">
              <Box fontSize="2rem" fontWeight="bold" mb={2}>
                404
              </Box>
              <Box>ページが見つかりません</Box>
            </Box>
          </Box>
        }
      />
    </Routes>
  )
}