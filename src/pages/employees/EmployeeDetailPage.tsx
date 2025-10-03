import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { useEmployee, useDeleteEmployee } from '../../hooks/api/useEmployees'
import { EmployeeWithAssignments } from '../../types/employee'
import { formatDate } from '../../utils/date'

export const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const {
    data: employee,
    isLoading,
    error,
    refetch
  } = useEmployee(id!)

  const deleteEmployeeMutation = useDeleteEmployee()

  const handleEdit = () => {
    navigate(`/employees/${id}/edit`)
  }

  const handleDelete = async () => {
    try {
      await deleteEmployeeMutation.mutateAsync(id!)
      setDeleteDialogOpen(false)
      navigate('/employees')
    } catch (error) {
      console.error('Failed to delete employee:', error)
    }
  }

  const handleBackToList = () => {
    navigate('/employees')
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          従業員の詳細情報の取得に失敗しました。
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

  if (!employee) {
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

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: '従業員一覧', href: '/employees' },
    { label: `${employee.first_name} ${employee.last_name}` }
  ]

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
                従業員詳細
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
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
                onClick={() => setDeleteDialogOpen(true)}
              >
                削除
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Basic Information Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              基本情報
            </Typography>
            <Grid container spacing={3}>
              {/* @ts-ignore MUI v7 Grid compatibility */}
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    氏名:
                  </Typography>
                  <Typography variant="body1">
                    {employee.first_name} {employee.last_name}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <EmailIcon color="action" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    メールアドレス:
                  </Typography>
                  <Typography variant="body1">
                    {employee.email}
                  </Typography>
                </Box>

                {employee.phone && (
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PhoneIcon color="action" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      電話番号:
                    </Typography>
                    <Typography variant="body1">
                      {employee.phone}
                    </Typography>
                  </Box>
                )}
              </Grid>

              {/* @ts-ignore MUI v7 Grid compatibility */}
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <BusinessIcon color="action" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    部署:
                  </Typography>
                  <Typography variant="body1">
                    {employee.department}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <WorkIcon color="action" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    役職:
                  </Typography>
                  <Typography variant="body1">
                    {employee.position}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CalendarIcon color="action" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    入社日:
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(employee.hire_date)}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    在籍状況:
                  </Typography>
                  <Chip
                    label={employee.status === 'active' ? '在籍中' : '退職済み'}
                    color={employee.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Current Assignments */}
        {(employee as EmployeeWithAssignments).current_assignments &&
         (employee as EmployeeWithAssignments).current_assignments!.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                現在の配属先
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>現場名</TableCell>
                      <TableCell>役割</TableCell>
                      <TableCell>開始日</TableCell>
                      <TableCell>状況</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(employee as EmployeeWithAssignments).current_assignments!.map((assignment) => (
                      <TableRow key={assignment.assignment_id}>
                        <TableCell>{assignment.site_name}</TableCell>
                        <TableCell>{assignment.role || '-'}</TableCell>
                        <TableCell>{formatDate(assignment.start_date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={assignment.status}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Assignment History */}
        {(employee as EmployeeWithAssignments).assignment_history &&
         (employee as EmployeeWithAssignments).assignment_history!.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                配属履歴
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>現場名</TableCell>
                      <TableCell>役割</TableCell>
                      <TableCell>開始日</TableCell>
                      <TableCell>終了日</TableCell>
                      <TableCell>状況</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(employee as EmployeeWithAssignments).assignment_history!.map((assignment) => (
                      <TableRow key={assignment.assignment_id}>
                        <TableCell>{assignment.site_name}</TableCell>
                        <TableCell>{assignment.role || '-'}</TableCell>
                        <TableCell>{formatDate(assignment.start_date)}</TableCell>
                        <TableCell>
                          {assignment.end_date ? formatDate(assignment.end_date) : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={assignment.status}
                            color={assignment.status === 'completed' ? 'default' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              システム情報
            </Typography>
            <Grid container spacing={2}>
              {/* @ts-ignore MUI v7 Grid compatibility */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {employee.id}
                </Typography>
              </Grid>
              {/* @ts-ignore MUI v7 Grid compatibility */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  作成日時
                </Typography>
                <Typography variant="body2">
                  {formatDate(employee.created_at)}
                </Typography>
              </Grid>
              {/* @ts-ignore MUI v7 Grid compatibility */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  更新日時
                </Typography>
                <Typography variant="body2">
                  {formatDate(employee.updated_at)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="従業員の削除"
        message={`${employee.first_name} ${employee.last_name} を削除してもよろしいですか？この操作は取り消せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        severity="error"
      />
    </Box>
  )
}