import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Box,
  Typography
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { AssignmentListItem } from '../../types/assignment'
import { formatDate } from '../../lib/utils'

type SortField = 'employee_name' | 'site_name' | 'start_date' | 'end_date' | 'role' | 'status'
type SortOrder = 'asc' | 'desc'

interface AssignmentTableProps {
  assignments: AssignmentListItem[]
  loading: boolean
  totalCount: number
  page: number
  rowsPerPage: number
  sortBy: SortField
  sortOrder: SortOrder
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onSort: (field: SortField) => void
  onViewEmployee: (employeeId: string) => void
  onViewSite: (siteId: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const getStatusChip = (status: 'upcoming' | 'active' | 'completed') => {
  const statusConfig = {
    upcoming: { label: '配属予定', color: 'info' as const },
    active: { label: '配属中', color: 'success' as const },
    completed: { label: '配属終了', color: 'default' as const }
  }
  const config = statusConfig[status]
  return <Chip label={config.label} color={config.color} size="small" />
}

export const AssignmentTable: React.FC<AssignmentTableProps> = ({
  assignments,
  loading,
  totalCount,
  page,
  rowsPerPage,
  sortBy,
  sortOrder,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onViewEmployee,
  onViewSite,
  onEdit,
  onDelete
}) => {
  const handleSort = (field: SortField) => {
    onSort(field)
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'employee_name'}
                  direction={sortBy === 'employee_name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('employee_name')}
                >
                  従業員名
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'site_name'}
                  direction={sortBy === 'site_name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('site_name')}
                >
                  現場名
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'role'}
                  direction={sortBy === 'role' ? sortOrder : 'asc'}
                  onClick={() => handleSort('role')}
                >
                  役割
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'start_date'}
                  direction={sortBy === 'start_date' ? sortOrder : 'asc'}
                  onClick={() => handleSort('start_date')}
                >
                  配属開始日
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'end_date'}
                  direction={sortBy === 'end_date' ? sortOrder : 'asc'}
                  onClick={() => handleSort('end_date')}
                >
                  配属終了日
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'status'}
                  direction={sortBy === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  ステータス
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">アクション</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" py={2}>
                    配属情報が見つかりません
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment.id} hover>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={() => onViewEmployee(assignment.employee_id)}
                    >
                      {assignment.employee_name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={() => onViewSite(assignment.site_id)}
                    >
                      {assignment.site_name}
                    </Box>
                  </TableCell>
                  <TableCell>{assignment.role}</TableCell>
                  <TableCell>{formatDate(assignment.start_date)}</TableCell>
                  <TableCell>
                    {assignment.end_date ? formatDate(assignment.end_date) : '未定'}
                  </TableCell>
                  <TableCell>{getStatusChip(assignment.status)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="編集">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(assignment.id)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="削除">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(assignment.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage="表示件数:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} 件 / 全 ${count} 件`}
      />
    </Paper>
  )
}