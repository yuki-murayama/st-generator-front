import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Toolbar,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Add as AddIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import SearchField from '../../components/common/SearchField'
import { EmployeeTable } from '../../components/employees/EmployeeTable'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import { useEmployees, useDeleteEmployee } from '../../hooks/api/useEmployees'
import { EmployeeListItem, EmployeeSearchParams } from '../../types/employee'

const DEPARTMENTS = [
  '全て',
  '開発部',
  '営業部',
  '管理部',
  '企画部',
  '人事部',
  '経理部'
]

const EMPLOYEE_STATUSES = [
  { value: '', label: '全て' },
  { value: 'active', label: '在籍' },
  { value: 'inactive', label: '退職' }
]

// const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100] // TODO: 後で使用予定

export const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate()

  // State for search and filtering
  const [searchParams, setSearchParams] = useState<EmployeeSearchParams>({
    query: '',
    department: '',
    status: undefined
  })

  // State for pagination and sorting
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [sortBy, setSortBy] = useState<string>('full_name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // API hooks
  const {
    data: employeesData,
    isLoading,
    error,
    refetch
  } = useEmployees({
    ...searchParams,
    page,
    limit: rowsPerPage,
    sortBy,
    sortOrder
  })

  const deleteEmployeeMutation = useDeleteEmployee()

  // パンくずリストのアイテム
  const breadcrumbItems = [
    { label: 'ダッシュボード', path: '/dashboard' },
    { label: '従業員管理', path: '/employees' }
  ]

  // 検索ハンドラー
  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query }))
    setPage(0) // Reset to first page
  }

  // フィルターハンドラー
  const handleDepartmentChange = (department: string) => {
    const dept = department === '全て' ? '' : department
    setSearchParams(prev => ({ ...prev, department: dept }))
    setPage(0)
  }

  const handleStatusChange = (status: string) => {
    setSearchParams(prev => ({
      ...prev,
      status: status === '' ? undefined : status as 'active' | 'inactive'
    }))
    setPage(0)
  }

  // ソートハンドラー
  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(0)
  }

  // ページネーションハンドラー
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  // アクションハンドラー
  const handleView = (employee: EmployeeListItem) => {
    navigate(`/employees/${employee.id}`)
  }

  const handleEdit = (employee: EmployeeListItem) => {
    navigate(`/employees/${employee.id}/edit`)
  }

  const handleDelete = async (employeeId: string) => {
    try {
      await deleteEmployeeMutation.mutateAsync(employeeId)
      // 削除後はデータを再取得
      refetch()
    } catch (error) {
      console.error('Failed to delete employee:', error)
    }
  }

  const handleCreateNew = () => {
    navigate('/employees/new')
  }

  const handleExport = () => {
    // エクスポート機能は後で実装
    console.log('Export functionality to be implemented')
  }

  const handleRefresh = () => {
    refetch()
  }

  // データの加工
  const employees = useMemo(() => {
    if (!employeesData?.data) return []

    return employeesData.data
  }, [employeesData?.data])

  const totalCount = employeesData?.count || 0

  return (
    <Box sx={{ p: 3 }}>
      {/* パンくずリスト */}
      <Breadcrumb customItems={breadcrumbItems} />

      {/* ページヘッダー */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          従業員管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          従業員の一覧、検索、追加、編集、削除を行うことができます
        </Typography>
      </Box>

      {/* 検索・フィルター・アクション */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          {/* 検索とフィルター */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ mb: 2 }}
          >
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <SearchField
                value={searchParams.query || ''}
                onChange={handleSearch}
                placeholder="名前、メールアドレスで検索..."
                loading={isLoading}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <FormControl fullWidth size="small">
                <InputLabel>部署</InputLabel>
                <Select
                  value={searchParams.department || ''}
                  label="部署"
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                >
                  {DEPARTMENTS.map(dept => (
                    <MenuItem key={dept} value={dept === '全て' ? '' : dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth size="small">
                <InputLabel>状況</InputLabel>
                <Select
                  value={searchParams.status || ''}
                  label="状況"
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {EMPLOYEE_STATUSES.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isLoading}
              sx={{ minWidth: 100 }}
            >
              更新
            </Button>
          </Stack>

          {/* アクションボタン */}
          <Toolbar sx={{ pl: 0, pr: 0 }}>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExport}
                disabled={isLoading || employees.length === 0}
              >
                エクスポート
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
              >
                新規登録
              </Button>
            </Box>
          </Toolbar>
        </CardContent>
      </Card>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          従業員データの取得に失敗しました: {error.message}
        </Alert>
      )}

      {/* 削除処理のエラー表示 */}
      {deleteEmployeeMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          従業員の削除に失敗しました: {deleteEmployeeMutation.error?.message}
        </Alert>
      )}

      {/* 削除処理の成功表示 */}
      {deleteEmployeeMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          従業員を削除しました
        </Alert>
      )}

      {/* 従業員テーブル */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* 削除処理中のローディング表示 */}
          {deleteEmployeeMutation.isPending && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                削除中...
              </Typography>
            </Box>
          )}

          <EmployeeTable
            employees={employees}
            loading={isLoading}
            error={error?.message}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSort={handleSort}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </Box>
  )
}