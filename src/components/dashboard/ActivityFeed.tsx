import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  Box,
  Skeleton,
  Divider
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material'
import { formatDate, formatDateTime } from '../../lib/utils'

export type ActivityType = 'employee_created' | 'employee_updated' | 'employee_deleted'
  | 'site_created' | 'site_updated' | 'site_deleted'
  | 'assignment_created' | 'assignment_updated' | 'assignment_deleted'

export interface Activity {
  id: string
  type: ActivityType
  description: string
  timestamp: Date
  user?: string
}

interface ActivityFeedProps {
  activities: Activity[]
  loading?: boolean
  maxItems?: number
}

const getActivityIcon = (type: ActivityType) => {
  if (type.includes('employee')) {
    if (type.includes('created')) return <PersonAddIcon />
    if (type.includes('updated')) return <EditIcon />
    if (type.includes('deleted')) return <DeleteIcon />
  }
  if (type.includes('site')) {
    return <LocationIcon />
  }
  if (type.includes('assignment')) {
    return <AssignmentIcon />
  }
  return <EditIcon />
}

const getActivityColor = (type: ActivityType): 'success' | 'info' | 'error' | 'warning' => {
  if (type.includes('created')) return 'success'
  if (type.includes('updated')) return 'info'
  if (type.includes('deleted')) return 'error'
  return 'info'
}

const getActivityLabel = (type: ActivityType): string => {
  if (type.includes('employee')) {
    if (type.includes('created')) return '従業員登録'
    if (type.includes('updated')) return '従業員更新'
    if (type.includes('deleted')) return '従業員削除'
  }
  if (type.includes('site')) {
    if (type.includes('created')) return '現場登録'
    if (type.includes('updated')) return '現場更新'
    if (type.includes('deleted')) return '現場削除'
  }
  if (type.includes('assignment')) {
    if (type.includes('created')) return '配属登録'
    if (type.includes('updated')) return '配属更新'
    if (type.includes('deleted')) return '配属削除'
  }
  return '更新'
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  maxItems = 10
}) => {
  const displayedActivities = activities.slice(0, maxItems)

  if (loading) {
    return (
      <Card>
        <CardHeader title="最近の活動" />
        <CardContent>
          <List>
            {[1, 2, 3, 4, 5].map((i) => (
              <React.Fragment key={i}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Skeleton variant="text" width="60%" />}
                    secondary={<Skeleton variant="text" width="40%" />}
                  />
                </ListItem>
                {i < 5 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    )
  }

  if (displayedActivities.length === 0) {
    return (
      <Card>
        <CardHeader title="最近の活動" />
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              最近の活動はありません
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="最近の活動"
        subheader={`直近${displayedActivities.length}件の更新`}
      />
      <CardContent sx={{ pt: 0 }}>
        <List sx={{ width: '100%' }}>
          {displayedActivities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: `${getActivityColor(activity.type)}.main`,
                      width: 40,
                      height: 40
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" component="span">
                        {activity.description}
                      </Typography>
                      <Chip
                        label={getActivityLabel(activity.type)}
                        size="small"
                        color={getActivityColor(activity.type)}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="caption" color="text.secondary" component="span" display="block" mt={0.5}>
                        {formatDateTime(activity.timestamp)}
                      </Typography>
                      {activity.user && (
                        <Typography variant="caption" color="text.secondary" component="span" display="block">
                          実行者: {activity.user}
                        </Typography>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < displayedActivities.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}