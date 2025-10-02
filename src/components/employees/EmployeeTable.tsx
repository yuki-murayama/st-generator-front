import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Box,
  Skeleton
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { EmployeeListItem } from '../../types/employee'
import ConfirmDialog from '../common/ConfirmDialog'

interface EmployeeTableProps {
  employees: EmployeeListItem[]
  loading?: boolean
  error?: string | null
  totalCount?: number
  page?: number
  rowsPerPage?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
  onSort?: (field: string) => void
  onView?: (employee: EmployeeListItem) => void
  onEdit?: (employee: EmployeeListItem) => void
  onDelete?: (employeeId: string) => void
}

interface HeadCell {
  id: keyof EmployeeListItem
  label: string
  sortable: boolean
  align?: 'left' | 'right' | 'center'
  minWidth?: number
}

const headCells: HeadCell[] = [
  { id: 'full_name', label: '名前', sortable: true, minWidth: 150 },
  { id: 'email', label: 'メールアドレス', sortable: true, minWidth: 200 },
  { id: 'department', label: '部署', sortable: true, minWidth: 120 },
  { id: 'position', label: '役職', sortable: true, minWidth: 120 },
  { id: 'status', label: '状況', sortable: true, align: 'center', minWidth: 100 },
  { id: 'current_site', label: '現在の配属', sortable: false, minWidth: 150 },
  { id: 'hire_date', label: '入社日', sortable: true, align: 'center', minWidth: 120 }
]

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading = false,
  error = null,
  totalCount = 0,
  page = 0,
  rowsPerPage = 25,
  sortBy = '',
  sortOrder = 'asc',
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onView,
  onEdit,
  onDelete
}) => {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    employeeId: string
    employeeName: string
  }>({
    open: false,
    employeeId: '',
    employeeName: ''
  })

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field)
    }
  }

  const handleDeleteClick = (employee: EmployeeListItem) => {
    setDeleteDialog({
      open: true,
      employeeId: employee.id,
      employeeName: employee.full_name
    })
  }

  const handleDeleteConfirm = () => {
    if (onDelete && deleteDialog.employeeId) {
      onDelete(deleteDialog.employeeId)
    }
    setDeleteDialog({ open: false, employeeId: '', employeeName: '' })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, employeeId: '', employeeName: '' })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '在籍'
      case 'inactive':
        return '退職'
      default:
        return status
    }
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="body1">
          エラーが発生しました: {error}
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <TableContainer sx={{ mt: 2 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align}
                  style={{ minWidth: headCell.minWidth }}
                  sortDirection={sortBy === headCell.id ? sortOrder : false}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={sortBy === headCell.id}
                      direction={sortBy === headCell.id ? sortOrder : 'asc'}
                      onClick={() => handleSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
              <TableCell align="center" style={{ minWidth: 120 }}>
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // ローディング時のスケルトン表示
              Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  {headCells.map((cell) => (
                    <TableCell key={cell.id}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Skeleton variant="circular" width={24} height={24} />
                      <Skeleton variant="circular" width={24} height={24} />
                      <Skeleton variant="circular" width={24} height={24} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    従業員データがありません
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow
                  key={employee.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onView?.(employee)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {employee.full_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {employee.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {employee.department}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {employee.position}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(employee.status)}
                      color={getStatusColor(employee.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {employee.current_site || '未配属'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {formatDate(employee.hire_date)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="詳細を表示">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            onView?.(employee)
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="編集">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(employee)
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="削除">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(employee)
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ページネーション */}
      {!loading && employees.length > 0 && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => onPageChange?.(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) =>
            onRowsPerPageChange?.(parseInt(event.target.value, 10))
          }
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="表示件数:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `${to}以上`}`
          }
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      )}

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="従業員の削除"
        message={`従業員「${deleteDialog.employeeName}」を削除しますか？この操作は元に戻せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="error"
      />
    </>
  )
}