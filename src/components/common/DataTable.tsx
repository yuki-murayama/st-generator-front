import React, { useState } from 'react'
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
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert,
  Typography
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { TableProps } from '../../types'

interface DataTableProps<T> extends TableProps<T> {
  selectable?: boolean
  onSelectionChange?: (selectedIds: string[]) => void
  actions?: {
    view?: (row: T) => void
    edit?: (row: T) => void
    delete?: (row: T) => void
    custom?: Array<{
      label: string
      icon: React.ReactElement
      onClick: (row: T) => void
    }>
  }
  emptyMessage?: string
  stickyHeader?: boolean
}

const DataTable = <T extends { id: string }>({
  data,
  columns,
  loading = false,
  error = null,
  onRowClick,
  onSort,
  pagination,
  selectable = false,
  onSelectionChange,
  actions,
  emptyMessage = 'データがありません',
  stickyHeader = false
}: DataTableProps<T>) => {
  const [selected, setSelected] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null)
  const [actionRowId, setActionRowId] = useState<string | null>(null)

  const handleSort = (column: keyof T) => {
    if (!onSort) return

    const isAsc = sortBy === column && sortDirection === 'asc'
    const newDirection = isAsc ? 'desc' : 'asc'

    setSortBy(column)
    setSortDirection(newDirection)
    onSort(column, newDirection)
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map(row => row.id)
      setSelected(newSelected)
      onSelectionChange?.(newSelected)
    } else {
      setSelected([])
      onSelectionChange?.([])
    }
  }

  const handleRowSelect = (id: string) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected: string[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
    onSelectionChange?.(newSelected)
  }

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, rowId: string) => {
    event.stopPropagation()
    setActionAnchorEl(event.currentTarget)
    setActionRowId(rowId)
  }

  const handleActionClose = () => {
    setActionAnchorEl(null)
    setActionRowId(null)
  }

  const handleActionSelect = (action: () => void) => {
    action()
    handleActionClose()
  }

  const isSelected = (id: string) => selected.indexOf(id) !== -1

  const hasActions = actions && (actions.view || actions.edit || actions.delete || actions.custom?.length)

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: stickyHeader ? 600 : undefined }}>
        <Table stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAll}
                    disabled={loading}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                      disabled={loading}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell align="right" sx={{ width: 64 }}>
                  アクション
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(pagination?.limit || 5)).map((_, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rectangular" width={18} height={18} />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={String(column.id)}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell>
                      <Skeleton variant="circular" width={24} height={24} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isItemSelected = isSelected(row.id)
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onChange={() => handleRowSelect(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.id]
                      const displayValue = column.format ? column.format(value) : String(value)

                      return (
                        <TableCell
                          key={String(column.id)}
                          align={column.align || 'left'}
                        >
                          {displayValue}
                        </TableCell>
                      )
                    })}
                    {hasActions && (
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, row.id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page}
          onPageChange={(_, newPage) => pagination.onPageChange(newPage)}
          onRowsPerPageChange={(e) => pagination.onLimitChange(parseInt(e.target.value, 10))}
          labelRowsPerPage="表示件数:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `${to}以上`}`
          }
          disabled={loading}
        />
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {actions?.view && (
          <MenuItem onClick={() => {
            const row = data.find(r => r.id === actionRowId)
            if (row) handleActionSelect(() => actions.view!(row))
          }}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>詳細</ListItemText>
          </MenuItem>
        )}
        {actions?.edit && (
          <MenuItem onClick={() => {
            const row = data.find(r => r.id === actionRowId)
            if (row) handleActionSelect(() => actions.edit!(row))
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>編集</ListItemText>
          </MenuItem>
        )}
        {actions?.delete && (
          <MenuItem onClick={() => {
            const row = data.find(r => r.id === actionRowId)
            if (row) handleActionSelect(() => actions.delete!(row))
          }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>削除</ListItemText>
          </MenuItem>
        )}
        {actions?.custom?.map((customAction, index) => (
          <MenuItem key={index} onClick={() => {
            const row = data.find(r => r.id === actionRowId)
            if (row) handleActionSelect(() => customAction.onClick(row))
          }}>
            <ListItemIcon>
              {customAction.icon}
            </ListItemIcon>
            <ListItemText>{customAction.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  )
}

export default DataTable