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
  CircularProgress,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  TextField
} from '@mui/material'
import {
  Add as AddIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  ViewList as TableViewIcon,
  ViewModule as CardViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import SearchField from '../../components/common/SearchField'
import { SiteTable } from '../../components/sites/SiteTable'
import { SiteCard } from '../../components/sites/SiteCard'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import { useSites, useSiteCards, useDeleteSite } from '../../hooks/api/useSites'
import { SiteSearchParams, SiteListItem, SiteCardData } from '../../types/site'

const LOCATIONS = [
  '全て',
  '東京都',
  '大阪府',
  '愛知県',
  '福岡県',
  '北海道',
  '宮城県',
  '広島県',
  '静岡県'
]

const SITE_STATUSES = [
  { value: '', label: '全て' },
  { value: 'active', label: '進行中' },
  { value: 'completed', label: '完了' },
  { value: 'suspended', label: '中断' }
]

type ViewMode = 'table' | 'card'

export const SiteListPage: React.FC = () => {
  const navigate = useNavigate()

  // State for search and filtering
  const [searchParams, setSearchParams] = useState<SiteSearchParams>({
    query: '',
    location: '',
    status: undefined,
    manager_name: '',
    start_date_from: undefined,
    start_date_to: undefined
  })

  // State for view mode
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  // State for filters panel
  const [showFilters, setShowFilters] = useState(false)

  // State for pagination and sorting (table view only)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // API hooks
  const {
    data: sitesData,
    isLoading: isLoadingSites,
    error: sitesError,
    refetch: refetchSites
  } = useSites(searchParams)

  const {
    data: siteCardsData,
    isLoading: isLoadingCards,
    error: cardsError,
    refetch: refetchCards
  } = useSiteCards(searchParams)

  const deleteMutation = useDeleteSite()

  // Computed values
  const sites = sitesData || []
  const siteCards = siteCardsData || []
  const isLoading = viewMode === 'table' ? isLoadingSites : isLoadingCards
  const error = viewMode === 'table' ? sitesError : cardsError

  // Event handlers
  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query }))
    setPage(0)
  }

  const handleLocationChange = (location: string) => {
    const value = location === '全て' ? '' : location
    setSearchParams(prev => ({ ...prev, location: value }))
    setPage(0)
  }

  const handleStatusChange = (status: string) => {
    setSearchParams(prev => ({
      ...prev,
      status: status as 'active' | 'completed' | 'suspended' | undefined
    }))
    setPage(0)
  }

  const handleManagerNameChange = (manager_name: string) => {
    setSearchParams(prev => ({ ...prev, manager_name }))
    setPage(0)
  }

  const handleStartDateFromChange = (date: Date | null) => {
    setSearchParams(prev => ({ ...prev, start_date_from: date || undefined }))
    setPage(0)
  }

  const handleStartDateToChange = (date: Date | null) => {
    setSearchParams(prev => ({ ...prev, start_date_to: date || undefined }))
    setPage(0)
  }

  const handleClearFilters = () => {
    setSearchParams({
      query: '',
      location: '',
      status: undefined,
      manager_name: '',
      start_date_from: undefined,
      start_date_to: undefined
    })
    setPage(0)
  }

  const handleRefresh = () => {
    if (viewMode === 'table') {
      refetchSites()
    } else {
      refetchCards()
    }
  }

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode)
    }
  }

  const handleAddNew = () => {
    navigate('/sites/new')
  }

  const handleView = (site: SiteListItem | SiteCardData) => {
    navigate(`/sites/${site.id}`)
  }

  const handleEdit = (site: SiteListItem | SiteCardData) => {
    navigate(`/sites/${site.id}/edit`)
  }

  const handleDelete = async (siteId: string) => {
    try {
      await deleteMutation.mutateAsync(siteId)
      handleRefresh()
    } catch (error) {
      console.error('Failed to delete site:', error)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: '現場一覧' }
  ]

  if (error) {
    return (
      <Box p={3}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert severity="error" sx={{ mt: 2 }}>
          データの取得に失敗しました: {error.message}
        </Alert>
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
            <Typography variant="h4" component="h1">
              現場一覧
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isLoading}
              >
                更新
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                disabled={isLoading || sites.length === 0}
              >
                エクスポート
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
              >
                現場新規登録
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Search and Controls */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ flexGrow: 1, maxWidth: 400 }}>
                  <SearchField
                    placeholder="現場名、所在地で検索..."
                    value={searchParams.query || ''}
                    onChange={handleSearch}
                  />
                </Box>
                <Button
                  variant={showFilters ? "contained" : "outlined"}
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  フィルター
                </Button>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  size="small"
                >
                  <ToggleButton value="table">
                    <TableViewIcon />
                  </ToggleButton>
                  <ToggleButton value="card">
                    <CardViewIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Filters */}
              {showFilters && (
                <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>所在地</InputLabel>
                        <Select
                          value={searchParams.location || '全て'}
                          label="所在地"
                          onChange={(e) => handleLocationChange(e.target.value)}
                        >
                          {LOCATIONS.map((location) => (
                            <MenuItem key={location} value={location}>
                              {location}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>ステータス</InputLabel>
                        <Select
                          value={searchParams.status || ''}
                          label="ステータス"
                          onChange={(e) => handleStatusChange(e.target.value)}
                        >
                          {SITE_STATUSES.map((status) => (
                            <MenuItem key={status.value} value={status.value}>
                              {status.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="責任者名"
                        value={searchParams.manager_name || ''}
                        onChange={(e) => handleManagerNameChange(e.target.value)}
                        placeholder="責任者名で検索"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleClearFilters}
                        >
                          クリア
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <DatePicker
                        label="開始日（開始）"
                        value={searchParams.start_date_from}
                        onChange={handleStartDateFromChange}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <DatePicker
                        label="開始日（終了）"
                        value={searchParams.start_date_to}
                        onChange={handleStartDateToChange}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : viewMode === 'table' ? (
          <Card>
            <SiteTable
              sites={sites}
              loading={isLoading}
              error={error?.message || null}
              totalCount={sites.length}
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
          </Card>
        ) : (
          <Box>
            {siteCards.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography variant="body1" color="text.secondary">
                  現場が見つかりません
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {siteCards.map((site) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={site.id}>
                    <SiteCard
                      site={site}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  )
}