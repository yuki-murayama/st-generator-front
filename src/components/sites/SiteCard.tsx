// @ts-nocheck
import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  Stack,
  Button
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  Business as BusinessIcon
} from '@mui/icons-material'
import { SiteCardData } from '../../types/site'
import ConfirmDialog from '../common/ConfirmDialog'

interface SiteCardProps {
  site: SiteCardData
  onView?: (site: SiteCardData) => void
  onEdit?: (site: SiteCardData) => void
  onDelete?: (siteId: string) => void
}

const getStatusChip = (status: string, statusColor?: string) => {
  const statusLabels = {
    active: '進行中',
    completed: '完了',
    suspended: '中断'
  } as const

  const statusColors = {
    active: 'success',
    completed: 'default',
    suspended: 'warning'
  } as const

  return (
    <Chip
      label={statusLabels[status as keyof typeof statusLabels] || status}
      color={statusColors[status as keyof typeof statusColors] || 'default'}
      size="small"
      sx={{
        bgcolor: statusColor,
        color: statusColor ? 'white' : undefined
      }}
    />
  )
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  onView,
  onEdit,
  onDelete
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleView = () => {
    onView?.(site)
  }

  const handleEdit = () => {
    onEdit?.(site)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    onDelete?.(site.id)
    setDeleteDialogOpen(false)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[4]
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box sx={{ flexGrow: 1, mr: 1 }}>
              <Typography variant="h6" component="h3" noWrap title={site.name}>
                {site.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <LocationIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {site.location}
                </Typography>
              </Box>
            </Box>
            <Box>
              {getStatusChip(site.status, site.status_color)}
            </Box>
          </Box>

          {/* Manager */}
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {site.manager_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                現場責任者
              </Typography>
            </Box>
          </Box>

          {/* Stats */}
          <Stack spacing={1.5}>
            {/* Assigned Count */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={0.5}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2">配属人数</Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {site.assigned_count}名
              </Typography>
            </Box>

            {/* Progress */}
            {site.progress !== undefined && (
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                  <Typography variant="body2">進捗</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {site.progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={site.progress}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}

            {/* Duration */}
            {site.duration && (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2">期間</Typography>
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  {site.duration}
                </Typography>
              </Box>
            )}

            {/* Description */}
            {site.description && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4
                  }}
                >
                  {site.description}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box display="flex" gap={0.5}>
              {onView && (
                <Tooltip title="詳細表示">
                  <IconButton size="small" onClick={handleView}>
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onEdit && (
                <Tooltip title="編集">
                  <IconButton size="small" onClick={handleEdit}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="削除">
                  <IconButton size="small" color="error" onClick={handleDeleteClick}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {onView && (
              <Button size="small" onClick={handleView}>
                詳細を見る
              </Button>
            )}
          </Box>
        </CardActions>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="現場削除の確認"
        message={`「${site.name}」を削除してもよろしいですか？この操作は取り消せません。`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="削除"
        cancelText="キャンセル"
        severity="error"
      />
    </>
  )
}