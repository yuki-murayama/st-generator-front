import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Skeleton
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  PersonAdd as AssignIcon
} from '@mui/icons-material'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import { SiteInfo } from '../../components/sites/SiteInfo'
import { AssignedEmployeesList } from '../../components/sites/AssignedEmployeesList'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { useSite, useDeleteSite } from '../../hooks/api/useSites'

export const SiteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // API hooks
  const { data: site, isLoading, error } = useSite(id || '')
  const deleteMutation = useDeleteSite()

  const handleBack = () => {
    navigate('/sites')
  }

  const handleEdit = () => {
    navigate(`/sites/${id}/edit`)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!id) return

    try {
      await deleteMutation.mutateAsync(id)
      setDeleteDialogOpen(false)
      navigate('/sites', { replace: true })
    } catch (error) {
      console.error('Failed to delete site:', error)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  const handleAssignment = () => {
    // TODO: 配属管理画面への遷移（現場を事前選択）
    navigate(`/assignments?site=${id}`)
  }

  const handleViewEmployee = (employeeId: string) => {
    navigate(`/employees/${employeeId}`)
  }

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: '現場一覧', href: '/sites' },
    { label: site?.name || '詳細' }
  ]

  if (!id) {
    return (
      <Box p={3}>
        <Alert severity="error">現場IDが指定されていません</Alert>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert severity="error" sx={{ mt: 2 }}>
          現場情報の取得に失敗しました: {error.message}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          現場一覧に戻る
        </Button>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box p={3}>
        <Breadcrumb items={breadcrumbItems} />
        <Box mt={2}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Box>
    )
  }

  if (!site) {
    return (
      <Box p={3}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert severity="warning" sx={{ mt: 2 }}>
          現場が見つかりません
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          現場一覧に戻る
        </Button>
      </Box>
    )
  }

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
              現場詳細
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={handleBack}
              >
                戻る
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssignIcon />}
                onClick={handleAssignment}
              >
                配属管理
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                編集
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
              >
                削除
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Site Information */}
        <SiteInfo site={site} />

        {/* Assigned Employees */}
        <AssignedEmployeesList
          site={site}
          onViewEmployee={handleViewEmployee}
        />
      </Stack>

      {/* Delete Confirmation Dialog */}
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
    </Box>
  )
}