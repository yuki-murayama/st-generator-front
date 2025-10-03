import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  TrendingUp as ProgressIcon
} from '@mui/icons-material'
import { SiteWithAssignments } from '../../types/site'

interface SiteInfoProps {
  site: SiteWithAssignments
}

const getStatusChip = (status: string) => {
  switch (status) {
    case 'active':
      return <Chip label="進行中" color="success" />
    case 'completed':
      return <Chip label="完了" color="default" />
    case 'suspended':
      return <Chip label="中断" color="warning" />
    default:
      return <Chip label={status} color="default" />
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const InfoItem: React.FC<{
  icon: React.ReactElement
  label: string
  value: string | React.ReactNode
  fullWidth?: boolean
}> = ({ icon, label, value, fullWidth = false }) => (
  // @ts-ignore MUI v7 Grid compatibility
  <Grid item xs={12} sm={fullWidth ? 12 : 6}>
    <Box display="flex" alignItems="flex-start" gap={1.5}>
      <Box
        sx={{
          color: 'action.active',
          mt: 0.5,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {value}
        </Typography>
      </Box>
    </Box>
  </Grid>
)

export const SiteInfo: React.FC<SiteInfoProps> = ({ site }) => {
  // 進捗計算
  let progress: number | undefined
  if (site.start_date && site.end_date) {
    const startDate = new Date(site.start_date)
    const endDate = new Date(site.end_date)
    const now = new Date()

    if (now >= startDate && now <= endDate) {
      const totalDuration = endDate.getTime() - startDate.getTime()
      const elapsedDuration = now.getTime() - startDate.getTime()
      progress = Math.round((elapsedDuration / totalDuration) * 100)
    } else if (now > endDate) {
      progress = 100
    } else {
      progress = 0
    }
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              {site.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {site.location}
              </Typography>
            </Box>
          </Box>
          <Box>
            {getStatusChip(site.status)}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <InfoItem
            icon={<PersonIcon />}
            label="現場責任者"
            value={site.manager_name}
          />
          <InfoItem
            icon={<BusinessIcon />}
            label="配属人数"
            value={`${site.assigned_employees?.length || 0}名`}
          />
          <InfoItem
            icon={<CalendarIcon />}
            label="開始日"
            value={site.start_date ? formatDate(site.start_date) : '未設定'}
          />
          <InfoItem
            icon={<CalendarIcon />}
            label="終了日"
            value={site.end_date ? formatDate(site.end_date) : '未設定'}
          />

          {progress !== undefined && (
            // @ts-ignore MUI v7 Grid compatibility
            <Grid item xs={12}>
              <Box>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <ProgressIcon color="action" />
                  <Typography variant="caption" color="text.secondary">
                    進捗状況
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" ml="auto">
                    {progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>
          )}

          {site.description && (
            <InfoItem
              icon={<DescriptionIcon />}
              label="備考"
              value={site.description}
              fullWidth
            />
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}