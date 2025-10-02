import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import { AssignmentTable } from '../../components/assignments/AssignmentTable'
import { AssignmentForm } from '../../components/assignments/AssignmentForm'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import {
  useAssignments,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useEmployeeOptions,
  useSiteOptions
} from '../../hooks/api/useAssignments'
import { AssignmentSearchParams, CreateAssignmentData, UpdateAssignmentData } from '../../types/assignment'

type SortField = 'employee_name' | 'site_name' | 'start_date' | 'end_date' | 'role' | 'status'
type SortOrder = 'asc' | 'desc'

export const AssignmentManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const [urlSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState<SortField>('start_date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // URL params for pre-selection
  const preSelectedEmployeeId = urlSearchParams.get('employee') || undefined
  const preSelectedSiteId = urlSearchParams.get('site') || undefined

  // Search params state
  const [searchParams, setSearchParams] = useState<AssignmentSearchParams>({
    employee_id: preSelectedEmployeeId,
    site_id: preSelectedSiteId,
    status: undefined,
    search: ''
  })

  // API hooks
  const { data: assignments = [], isLoading, error: apiError } = useAssignments(searchParams)
  const { data: employeeOptions = [] } = useEmployeeOptions()
  const { data: siteOptions = [] } = useSiteOptions()
  const createMutation = useCreateAssignment()
  const updateMutation = useUpdateAssignment()
  const deleteMutation = useDeleteAssignment()

  // Open form on mount if pre-selection exists
  useEffect(() => {
    if (preSelectedEmployeeId || preSelectedSiteId) {
      setShowForm(true)
    }
  }, [preSelectedEmployeeId, preSelectedSiteId])

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleCreateClick = () => {
    setEditingId(null)
    setShowForm(true)
  }

  const handleEditClick = (id: string) => {
    setEditingId(id)
    setShowForm(true)
  }

  const handleDeleteClick = (id: string) => {
    const assignment = assignments.find(a => a.id === id)
    if (assignment) {
      setDeleteTarget({
        id,
        name: `${assignment.employee_name} → ${assignment.site_name}`
      })
      setDeleteDialogOpen(true)
    }
  }

  const handleFormSubmit = async (data: CreateAssignmentData | UpdateAssignmentData) => {
    setError(null)

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: data as UpdateAssignmentData
        })
      } else {
        await createMutation.mutateAsync(data as CreateAssignmentData)
      }
      setShowForm(false)
      setEditingId(null)
    } catch (err) {
      console.error('Failed to save assignment:', err)
      setError(editingId ? '配属の更新に失敗しました' : '配属の登録に失敗しました')
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch (error) {
      console.error('Failed to delete assignment:', error)
      setError('配属の削除に失敗しました')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  const handleViewEmployee = (employeeId: string) => {
    navigate(`/employees/${employeeId}`)
  }

  const handleViewSite = (siteId: string) => {
    navigate(`/sites/${siteId}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchParams(prev => ({ ...prev, search: value }))
    setPage(0)
  }

  const handleFilterChange = (key: keyof AssignmentSearchParams, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: '配属管理' }
  ]

  const editingAssignment = editingId ? assignments.find(a => a.id === editingId) : undefined

  // Apply client-side sorting
  const sortedAssignments = [...assignments].sort((a, b) => {
    let aValue: any = a[sortBy]
    let bValue: any = b[sortBy]

    if (sortBy === 'start_date' || sortBy === 'end_date') {
      aValue = aValue ? new Date(aValue).getTime() : 0
      bValue = bValue ? new Date(bValue).getTime() : 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Apply pagination
  const paginatedAssignments = sortedAssignments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

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
              配属管理
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                フィルター
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateClick}
              >
                新規登録
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* API Error Alert */}
        {apiError && (
          <Alert severity="error">
            配属情報の取得に失敗しました: {apiError.message}
          </Alert>
        )}

        {/* Filters */}
        {showFilters && (
          <Box component={Grid} container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="検索"
                fullWidth
                value={searchParams.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="従業員名、現場名、役割"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>従業員</InputLabel>
                <Select
                  value={searchParams.employee_id || ''}
                  label="従業員"
                  onChange={(e) => handleFilterChange('employee_id', e.target.value || undefined)}
                >
                  <MenuItem value="">すべて</MenuItem>
                  {employeeOptions.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>現場</InputLabel>
                <Select
                  value={searchParams.site_id || ''}
                  label="現場"
                  onChange={(e) => handleFilterChange('site_id', e.target.value || undefined)}
                >
                  <MenuItem value="">すべて</MenuItem>
                  {siteOptions.map(site => (
                    <MenuItem key={site.id} value={site.id}>{site.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>ステータス</InputLabel>
                <Select
                  value={searchParams.status || ''}
                  label="ステータス"
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                  <MenuItem value="">すべて</MenuItem>
                  <MenuItem value="upcoming">配属予定</MenuItem>
                  <MenuItem value="active">配属中</MenuItem>
                  <MenuItem value="completed">配属終了</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Box>
        )}

        {/* Table */}
        <AssignmentTable
          assignments={paginatedAssignments}
          loading={isLoading}
          totalCount={sortedAssignments.length}
          page={page}
          rowsPerPage={rowsPerPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value)
            setPage(0)
          }}
          onSort={handleSort}
          onViewEmployee={handleViewEmployee}
          onViewSite={handleViewSite}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </Stack>

      {/* Form Dialog */}
      <Dialog
        open={showForm}
        onClose={handleFormCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingId ? '配属編集' : '配属新規登録'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <AssignmentForm
              assignment={editingAssignment}
              employeeOptions={employeeOptions}
              siteOptions={siteOptions}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={createMutation.isPending || updateMutation.isPending}
              isEdit={Boolean(editingId)}
              preSelectedEmployeeId={preSelectedEmployeeId}
              preSelectedSiteId={preSelectedSiteId}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="配属削除の確認"
        message={`配属情報「${deleteTarget?.name}」を削除してもよろしいですか？この操作は取り消せません。`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="削除"
        cancelText="キャンセル"
        severity="error"
      />
    </Box>
  )
}