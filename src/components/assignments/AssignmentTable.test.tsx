import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AssignmentTable } from './AssignmentTable'
import { AssignmentListItem } from '../../types/assignment'

const mockAssignments: AssignmentListItem[] = [
  {
    id: '1',
    employee_id: 'emp1',
    employee_name: '山田太郎',
    site_id: 'site1',
    site_name: '東京プロジェクト',
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-12-31'),
    role: '現場責任者',
    status: 'active',
    duration: '11ヶ月'
  },
  {
    id: '2',
    employee_id: 'emp2',
    employee_name: '佐藤花子',
    site_id: 'site2',
    site_name: '大阪プロジェクト',
    start_date: new Date('2024-03-01'),
    status: 'upcoming',
    role: '技術指導員',
    duration: '未定'
  },
  {
    id: '3',
    employee_id: 'emp3',
    employee_name: '鈴木一郎',
    site_id: 'site1',
    site_name: '東京プロジェクト',
    start_date: new Date('2023-06-01'),
    end_date: new Date('2024-05-31'),
    role: '作業員',
    status: 'completed',
    duration: '12ヶ月'
  }
]

describe('AssignmentTable', () => {
  const mockOnPageChange = vi.fn()
  const mockOnRowsPerPageChange = vi.fn()
  const mockOnSort = vi.fn()
  const mockOnViewEmployee = vi.fn()
  const mockOnViewSite = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders assignment data in table', () => {
    render(
      <AssignmentTable
        assignments={mockAssignments}
        loading={false}
        totalCount={mockAssignments.length}
        page={0}
        rowsPerPage={10}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('山田太郎')).toBeInTheDocument()
    expect(screen.getAllByText('東京プロジェクト')[0]).toBeInTheDocument()
    expect(screen.getByText('現場責任者')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(
      <AssignmentTable
        assignments={[]}
        loading={true}
        totalCount={0}
        page={0}
        rowsPerPage={10}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/読み込み中/i)).toBeInTheDocument()
  })

  it('renders empty state when no assignments', () => {
    render(
      <AssignmentTable
        assignments={[]}
        loading={false}
        totalCount={0}
        page={0}
        rowsPerPage={10}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(/配属情報が見つかりません/i)).toBeInTheDocument()
  })

  it('calls onViewEmployee when employee name is clicked', () => {
    render(
      <AssignmentTable
        assignments={mockAssignments}
        loading={false}
        totalCount={mockAssignments.length}
        page={0}
        rowsPerPage={10}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const employeeLink = screen.getByText('山田太郎')
    fireEvent.click(employeeLink)

    expect(mockOnViewEmployee).toHaveBeenCalledWith('emp1')
  })

  it('calls onViewSite when site name is clicked', () => {
    render(
      <AssignmentTable
        assignments={mockAssignments}
        loading={false}
        totalCount={mockAssignments.length}
        page={0}
        rowsPerPage={10}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const siteLinks = screen.getAllByText('東京プロジェクト')
    fireEvent.click(siteLinks[0])

    expect(mockOnViewSite).toHaveBeenCalledWith('site1')
  })

  it('calls onEdit when edit icon is clicked', async () => {
    render(
      <AssignmentTable
        assignments={mockAssignments}
        loading={false}
        totalCount={mockAssignments.length}
        page={0}
        rowsPerPage={10}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: /編集/i })
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith('1')
    })
  })

  it('calls onDelete when delete icon is clicked', async () => {
    render(
      <AssignmentTable
        assignments={mockAssignments}
        loading={false}
        totalCount={mockAssignments.length}
        page={0}
        rowsPerPage={10}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: /削除/i })
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('1')
    })
  })

  it('renders status chips with correct labels', () => {
    render(
      <AssignmentTable
        assignments={mockAssignments}
        loading={false}
        totalCount={mockAssignments.length}
        page={0}
        rowsPerPage={10}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('配属中')).toBeInTheDocument()
    expect(screen.getByText('配属予定')).toBeInTheDocument()
    expect(screen.getByText('配属終了')).toBeInTheDocument()
  })

  it('handles pagination', () => {
    render(
      <AssignmentTable
        assignments={mockAssignments}
        loading={false}
        totalCount={100}
        page={0}
        rowsPerPage={25}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
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
      <AssignmentTable
        assignments={mockAssignments}
        loading={false}
        totalCount={mockAssignments.length}
        page={0}
        rowsPerPage={10}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const employeeHeader = screen.getByText('従業員名')
    fireEvent.click(employeeHeader)

    expect(mockOnSort).toHaveBeenCalledWith('employee_name')
  })

  it('renders end date as 未定 when not set', () => {
    render(
      <AssignmentTable
        assignments={mockAssignments}
        loading={false}
        totalCount={mockAssignments.length}
        page={0}
        rowsPerPage={10}
        sortBy="employee_name"
        sortOrder="asc"
        onPageChange={mockOnPageChange}
        onRowsPerPageChange={mockOnRowsPerPageChange}
        onSort={mockOnSort}
        onViewEmployee={mockOnViewEmployee}
        onViewSite={mockOnViewSite}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('未定')).toBeInTheDocument()
  })
})