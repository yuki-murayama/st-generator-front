import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Skeleton
} from '@mui/material'
import {
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'

interface StatCardData {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

interface StatsCardsProps {
  employeeCount: number
  siteCount: number
  activeAssignmentCount: number
  loading?: boolean
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  employeeCount,
  siteCount,
  activeAssignmentCount,
  loading = false
}) => {
  const stats: StatCardData[] = [
    {
      title: '従業員数',
      value: employeeCount,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2'
    },
    {
      title: '現場数',
      value: siteCount,
      icon: <LocationIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32'
    },
    {
      title: '配属中',
      value: activeAssignmentCount,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02'
    }
  ]

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={48} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card
            sx={{
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    {stat.title}
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ fontWeight: 'bold', color: stat.color, mt: 1 }}
                  >
                    {stat.value.toLocaleString()}
                  </Typography>
                  {stat.trend && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <TrendingUpIcon
                        sx={{
                          fontSize: 16,
                          color: stat.trend.isPositive ? 'success.main' : 'error.main',
                          transform: stat.trend.isPositive ? 'none' : 'rotate(180deg)'
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          ml: 0.5,
                          color: stat.trend.isPositive ? 'success.main' : 'error.main'
                        }}
                      >
                        {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box
                  sx={{
                    backgroundColor: `${stat.color}15`,
                    borderRadius: 2,
                    p: 1.5,
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}