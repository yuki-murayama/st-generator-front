import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import { EmployeeForm } from '../../components/employees/EmployeeForm'
import { useEmployee, useCreateEmployee, useUpdateEmployee } from '../../hooks/api/useEmployees'
import { CreateEmployeeData, UpdateEmployeeData } from '../../types'

export const EmployeeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const {
    data: employee,
    isLoading: isLoadingEmployee,
    error: loadError
  } = useEmployee(id!, { enabled: isEdit })

  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()

  const isLoading = isLoadingEmployee || createMutation.isPending || updateMutation.isPending

  const handleSubmit = async (data: CreateEmployeeData | UpdateEmployeeData) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, ...data } as UpdateEmployeeData)
      } else {
        await createMutation.mutateAsync(data as CreateEmployeeData)
      }
      navigate('/employees')
    } catch (error) {
      console.error('Failed to save employee:', error)
    }
  }

  const handleBackToList = () => {
    navigate('/employees')
  }

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: '従業員一覧', href: '/employees' },
    { label: isEdit ? '従業員編集' : '従業員新規登録' }
  ]

  if (isEdit && isLoadingEmployee) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (isEdit && loadError) {
    return (
      <Box p={3}>
        <Alert severity="error">
          従業員の情報の取得に失敗しました。
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
          sx={{ mt: 2 }}
        >
          従業員一覧に戻る
        </Button>
      </Box>
    )
  }

  if (isEdit && !employee) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          指定された従業員が見つかりません。
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
          sx={{ mt: 2 }}
        >
          従業員一覧に戻る
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={handleBackToList}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1">
                {isEdit ? '従業員編集' : '従業員新規登録'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Error Messages */}
        {createMutation.error && (
          <Alert severity="error">
            従業員の登録に失敗しました: {createMutation.error.message}
          </Alert>
        )}
        {updateMutation.error && (
          <Alert severity="error">
            従業員の更新に失敗しました: {updateMutation.error.message}
          </Alert>
        )}

        {/* Form */}
        <EmployeeForm
          employee={employee}
          onSubmit={handleSubmit}
          onCancel={handleBackToList}
          isLoading={isLoading}
          isEdit={isEdit}
        />
      </Stack>
    </Box>
  )
}