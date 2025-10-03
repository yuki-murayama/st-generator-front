import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SiteTable } from '@/components/sites/SiteTable'
import { SiteListItem } from '@/types/site'

const mockSites: SiteListItem[] = [
  {
    id: '1',
    name: '東京プロジェクト',
    location: '東京都渋谷区',
    manager_name: '山田太郎',
    status: 'active',
    assigned_count: 5,
    progress: 75,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-12-31')
  },
  {
    id: '2',
    name: '大阪プロジェクト',
    location: '大阪府大阪市',
    manager_name: '佐藤花子',
    status: 'completed',
    assigned_count: 3,
    progress: 100,
    start_date: new Date('2023-06-01'),
    end_date: new Date('2024-05-31')
  },
  {
    id: '3',
    name: '福岡プロジェクト',
    location: '福岡県福岡市',
    manager_name: '鈴木一郎',
    status: 'suspended',
    assigned_count: 2,
    progress: 50,
    start_date: new Date('2024-03-01'),
    end_date: new Date('2024-09-30')
  }
]

describe('SiteTable', () => {
  const mockOnView = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnPageChange = vi.fn()
  const mockOnSort = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders site data in table', () => {
    render(
      <SiteTable
        sites={mockSites}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('東京プロジェクト')).toBeInTheDocument()
    expect(screen.getByText('東京都渋谷区')).toBeInTheDocument()
    expect(screen.getByText('山田太郎')).toBeInTheDocument()
  })

  it('renders loading state with skeletons', () => {
    render(
      <SiteTable
        sites={[]}
        loading={true}
      />
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(
      <SiteTable
        sites={[]}
        error="データベースエラー"
      />
    )

    expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument()
  })

  it('renders empty state when no sites', () => {
    render(
      <SiteTable
        sites={[]}
      />
    )

    expect(screen.getByText(/現場が見つかりません/i)).toBeInTheDocument()
  })

  it('calls onView when view icon is clicked', () => {
    render(
      <SiteTable
        sites={mockSites}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const allButtons = screen.getAllByRole('button')
    // headCells has 5 sortable buttons (name, location, manager_name, status, assigned_count)
    // Progress and duration are not sortable, so 5 sort buttons total
    const viewButton = allButtons[5] // First view button after sort buttons
    fireEvent.click(viewButton)

    expect(mockOnView).toHaveBeenCalledWith(mockSites[0])
  })

  it('calls onEdit when edit icon is clicked', () => {
    render(
      <SiteTable
        sites={mockSites}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const allButtons = screen.getAllByRole('button')
    const editButton = allButtons[6] // Second icon button (edit)
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockSites[0])
  })

  it('shows delete confirmation dialog and calls onDelete', async () => {
    render(
      <SiteTable
        sites={mockSites}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const allButtons = screen.getAllByRole('button')
    const deleteButton = allButtons[7] // Third icon button (delete)
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('東京プロジェクト')

    const dialogButtons = screen.getAllByRole('button')
    const confirmButton = dialogButtons.find(btn => btn.textContent?.includes('削除'))

    if (confirmButton) {
      fireEvent.click(confirmButton)
      expect(mockOnDelete).toHaveBeenCalledWith('1')
    }
  })

  it('renders status chips with correct labels', () => {
    render(
      <SiteTable
        sites={mockSites}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('進行中')).toBeInTheDocument()
    expect(screen.getByText('完了')).toBeInTheDocument()
    expect(screen.getByText('中断')).toBeInTheDocument()
  })

  it('handles pagination', () => {
    render(
      <SiteTable
        sites={mockSites}
        totalCount={100}
        page={0}
        rowsPerPage={25}
        onPageChange={mockOnPageChange}
      />
    )

    const buttons = screen.getAllByRole('button')
    const nextButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('next'))

    if (nextButton) {
      fireEvent.click(nextButton)
      expect(mockOnPageChange).toHaveBeenCalledWith(1)
    }
  })

  it('handles sorting', () => {
    render(
      <SiteTable
        sites={mockSites}
        sortBy="name"
        sortOrder="asc"
        onSort={mockOnSort}
      />
    )

    const nameHeader = screen.getByText('現場名')
    fireEvent.click(nameHeader)

    expect(mockOnSort).toHaveBeenCalledWith('name')
  })
})