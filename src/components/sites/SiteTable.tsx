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
  Skeleton,
  LinearProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { SiteListItem } from '../../types/site'
import ConfirmDialog from '../common/ConfirmDialog'

interface SiteTableProps {
  sites: SiteListItem[]
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
  onView?: (site: SiteListItem) => void
  onEdit?: (site: SiteListItem) => void
  onDelete?: (siteId: string) => void
}

interface HeadCell {
  id: keyof SiteListItem
  label: string
  sortable: boolean
  align?: 'left' | 'right' | 'center'
  minWidth?: number
}

const headCells: HeadCell[] = [
  { id: 'name', label: '現場名', sortable: true, minWidth: 200 },
  { id: 'location', label: '所在地', sortable: true, minWidth: 150 },
  { id: 'manager_name', label: '現場責任者', sortable: true, minWidth: 120 },
  { id: 'status', label: 'ステータス', sortable: true, align: 'center', minWidth: 120 },
  { id: 'assigned_count', label: '配属人数', sortable: true, align: 'center', minWidth: 100 },
  { id: 'progress', label: '進捗', sortable: false, align: 'center', minWidth: 120 },
  { id: 'duration', label: '期間', sortable: false, align: 'center', minWidth: 150 }
]

const getStatusChip = (status: string) => {
  switch (status) {
    case 'active':
      return <Chip label="進行中" color="success" size="small" />
    case 'completed':
      return <Chip label="完了" color="default" size="small" />
    case 'suspended':
      return <Chip label="中断" color="warning" size="small" />
    default:
      return <Chip label={status} color="default" size="small" />
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export const SiteTable: React.FC<SiteTableProps> = ({
  sites,
  loading = false,
  error = null,
  totalCount = 0,
  page = 0,
  rowsPerPage = 10,
  sortBy = '',
  sortOrder = 'desc',
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onView,
  onEdit,
  onDelete
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<SiteListItem | null>(null)

  const handleSort = (field: string) => {
    onSort?.(field)
  }

  const handleView = (site: SiteListItem) => {
    onView?.(site)
  }

  const handleEdit = (site: SiteListItem) => {
    onEdit?.(site)
  }

  const handleDeleteClick = (site: SiteListItem) => {
    setSelectedSite(site)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedSite) {
      onDelete?.(selectedSite.id)
      setDeleteDialogOpen(false)
      setSelectedSite(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setSelectedSite(null)
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">エラーが発生しました: {error}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <TableContainer>
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
              Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={index}>
                  {headCells.map((headCell) => (
                    <TableCell key={headCell.id}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton variant="text" />
                  </TableCell>
                </TableRow>
              ))
            ) : sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headCells.length + 1} align="center">
                  <Typography variant="body2" color="text.secondary">
                    現場が見つかりません
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site) => (
                <TableRow key={site.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {site.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {site.location}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {site.manager_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {getStatusChip(site.status)}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {site.assigned_count}名
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {site.progress !== undefined ? (
                      <Box sx={{ width: '100%' }}>
                        <Box display="flex" alignItems="center" justifyContent="center" mb={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {site.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={site.progress}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {site.duration ? (
                      <Typography variant="body2">
                        {site.duration}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        未設定
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      {onView && (
                        <Tooltip title="詳細表示">
                          <IconButton
                            size="small"
                            onClick={() => handleView(site)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onEdit && (
                        <Tooltip title="編集">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(site)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip title="削除">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(site)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && totalCount > 0 && onPageChange && onRowsPerPageChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(event) =>
            onRowsPerPageChange(parseInt(event.target.value, 10))
          }
          labelRowsPerPage="1ページあたりの行数:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="現場削除の確認"
        message={
          selectedSite
            ? `「${selectedSite.name}」を削除してもよろしいですか？この操作は取り消せません。`
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="削除"
        cancelText="キャンセル"
        severity="error"
      />
    </Box>
  )
}