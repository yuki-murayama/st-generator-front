import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  Alert
} from '@mui/material'
import {
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material'
import Breadcrumb from '../components/navigation/Breadcrumb'
import { StatsCards } from '../components/dashboard/StatsCards'
import { ActivityFeed, Activity, ActivityType } from '../components/dashboard/ActivityFeed'
import { useEmployees } from '../hooks/api/useEmployees'
import { useSites } from '../hooks/api/useSites'
import { useAssignments } from '../hooks/api/useAssignments'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()

  // API hooks
  const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError } = useEmployees()
  const { data: sites = [], isLoading: isLoadingSites, error: sitesError } = useSites()
  const { data: assignments = [], isLoading: isLoadingAssignments, error: assignmentsError } = useAssignments()

  // Extract employees array from response object
  const employees = employeesData?.data || []

  // Calculate stats
  // Count only active employees (active status)
  const employeeCount = Array.isArray(employees)
    ? employees.filter(e => e.status === 'active').length
    : 0

  // Count only active sites (active status)
  const siteCount = Array.isArray(sites)
    ? sites.filter(s => s.status === 'active').length
    : 0

  // Count active assignments
  const activeAssignmentCount = Array.isArray(assignments)
    ? assignments.filter(a => a.status === 'active').length
    : 0

  // Generate recent activities from data
  const recentActivities = useMemo((): Activity[] => {
    const activities: Activity[] = []

    // Add recent employees (last 3)
    if (Array.isArray(employees)) {
      employees.slice(0, 3).forEach(emp => {
        activities.push({
          id: `emp-${emp.id}`,
          type: 'employee_created' as ActivityType,
          description: `従業員「${emp.name}」が登録されました`,
          timestamp: new Date(emp.created_at || Date.now())
        })
      })
    }

    // Add recent sites (last 3)
    if (Array.isArray(sites)) {
      sites.slice(0, 3).forEach(site => {
        activities.push({
          id: `site-${site.id}`,
          type: 'site_created' as ActivityType,
          description: `現場「${site.name}」が登録されました`,
          timestamp: new Date(site.start_date || Date.now())
        })
      })
    }

    // Add recent assignments (last 4)
    if (Array.isArray(assignments)) {
      assignments.slice(0, 4).forEach(assignment => {
        activities.push({
          id: `assign-${assignment.id}`,
          type: 'assignment_created' as ActivityType,
          description: `${assignment.employee_name} → ${assignment.site_name} の配属が登録されました`,
          timestamp: new Date(assignment.start_date || Date.now())
        })
      })
    }

    // Sort by timestamp descending
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [employees, sites, assignments])

  const isLoading = isLoadingEmployees || isLoadingSites || isLoadingAssignments
  const hasError = employeesError || sitesError || assignmentsError

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: 'ダッシュボード' }
  ]

  const quickActions = [
    {
      label: '従業員登録',
      icon: <PersonAddIcon />,
      color: 'primary' as const,
      onClick: () => navigate('/employees/new')
    },
    {
      label: '現場登録',
      icon: <LocationIcon />,
      color: 'success' as const,
      onClick: () => navigate('/sites/new')
    },
    {
      label: '配属登録',
      icon: <AssignmentIcon />,
      color: 'warning' as const,
      onClick: () => navigate('/assignments')
    }
  ]

  return (
    <Box p={3}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Breadcrumb items={breadcrumbItems} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
          >
            <Typography variant="h4" component="h1">
              ダッシュボード
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {hasError && (
          <Alert severity="error">
            データの取得に失敗しました。ページを再読み込みしてください。
          </Alert>
        )}

        {/* Stats Cards */}
        <StatsCards
          employeeCount={employeeCount}
          siteCount={siteCount}
          activeAssignmentCount={activeAssignmentCount}
          loading={isLoading}
        />

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              クイックアクション
            </Typography>
            <Grid container spacing={2} mt={1}>
              {quickActions.map((action, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Button
                    variant="contained"
                    color={action.color}
                    startIcon={action.icon}
                    onClick={action.onClick}
                    fullWidth
                    size="large"
                    sx={{ py: 1.5 }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <ActivityFeed
          activities={recentActivities}
          loading={isLoading}
          maxItems={10}
        />
      </Stack>
    </Box>
  )
}