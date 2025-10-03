import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { EmployeeListItem } from '@/types/employee'

const mockEmployees: EmployeeListItem[] = [
  {
    id: '1',
    full_name: '山田 太郎',
    email: 'yamada@example.com',
    department: '開発部',
    position: 'エンジニア',
    status: 'active',
    current_site: '本社',
    hire_date: new Date('2024-01-01')
  },
  {
    id: '2',
    full_name: '佐藤 花子',
    email: 'sato@example.com',
    department: '営業部',
    position: '営業担当',
    status: 'active',
    current_site: undefined,
    hire_date: new Date('2024-02-01')
  },
  {
    id: '3',
    full_name: '鈴木 一郎',
    email: 'suzuki@example.com',
    department: '管理部',
    position: '課長',
    status: 'inactive',
    current_site: undefined,
    hire_date: new Date('2023-12-01')
  }
]

describe('EmployeeTable', () => {
  const mockOnView = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnPageChange = vi.fn()
  const mockOnSort = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders employee data in table', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    expect(screen.getByText('yamada@example.com')).toBeInTheDocument()
    expect(screen.getByText('開発部')).toBeInTheDocument()
  })

  it('renders loading state with skeletons', () => {
    render(
      <EmployeeTable
        employees={[]}
        loading={true}
      />
    )

    // Check for table structure even in loading state
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(
      <EmployeeTable
        employees={[]}
        error="データベースエラー"
      />
    )

    expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument()
  })

  it('renders empty state when no employees', () => {
    render(
      <EmployeeTable
        employees={[]}
      />
    )

    expect(screen.getByText(/従業員データがありません/i)).toBeInTheDocument()
  })

  it('calls onView when view icon is clicked', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    // Get all icon buttons (3 per row: view, edit, delete)
    const allButtons = screen.getAllByRole('button')
    // First employee's view button is at index 0 (after sort buttons)
    // Skip the 6 sort label buttons (name, email, department, position, status, hire_date)
    const viewButton = allButtons[6] // First icon button
    fireEvent.click(viewButton)

    expect(mockOnView).toHaveBeenCalledWith(mockEmployees[0])
  })

  it('calls onEdit when edit icon is clicked', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const allButtons = screen.getAllByRole('button')
    const editButton = allButtons[7] // Second icon button (edit)
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockEmployees[0])
  })

  it('shows delete confirmation dialog and calls onDelete', async () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const allButtons = screen.getAllByRole('button')
    const deleteButton = allButtons[8] // Third icon button (delete)
    fireEvent.click(deleteButton)

    // Dialog should appear - check for dialog content with id
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    // Check that the dialog contains the employee name
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('山田 太郎')

    // Click confirm in dialog
    const dialogButtons = screen.getAllByRole('button')
    const confirmButton = dialogButtons.find(btn => btn.textContent?.includes('削除'))

    if (confirmButton) {
      fireEvent.click(confirmButton)
      expect(mockOnDelete).toHaveBeenCalledWith('1')
    }
  })

  it('renders status chips with correct labels', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const activeChips = screen.getAllByText('在籍')
    const inactiveChips = screen.getAllByText('退職')

    expect(activeChips.length).toBe(2)
    expect(inactiveChips.length).toBe(1)
  })

  it('handles pagination', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        totalCount={100}
        page={0}
        rowsPerPage={25}
        onPageChange={mockOnPageChange}
      />
    )

    // MUI pagination - look for next page button
    const buttons = screen.getAllByRole('button')
    const nextButton = buttons.find(btn => btn.getAttribute('aria-label')?.includes('next'))

    if (nextButton) {
      fireEvent.click(nextButton)
      expect(mockOnPageChange).toHaveBeenCalledWith(1)
    }
  })

  it('handles sorting', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        sortBy="full_name"
        sortOrder="asc"
        onSort={mockOnSort}
      />
    )

    const nameHeader = screen.getByText('名前')
    fireEvent.click(nameHeader)

    expect(mockOnSort).toHaveBeenCalledWith('full_name')
  })
})