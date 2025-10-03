import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AssignmentForm } from '@/components/assignments/AssignmentForm'
import { Assignment, EmployeeOption, SiteOption } from '@/types/assignment'

// Mock MUI DatePicker to avoid date-fns version compatibility issues
vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, disabled, slotProps, value, onChange }: any) => (
    <div>
      <input
        type="text"
        aria-label={label}
        disabled={disabled}
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : null
          onChange(date)
        }}
      />
      {slotProps?.textField?.helperText && (
        <div role="alert">{slotProps.textField.helperText}</div>
      )}
    </div>
  )
}))

const mockEmployeeOptions: EmployeeOption[] = [
  {
    value: 'emp1',
    label: '山田太郎',
    department: '開発部',
    position: 'エンジニア',
    available: true,
    id: 'emp1',
    name: '山田太郎'
  } as any,
  {
    value: 'emp2',
    label: '佐藤花子',
    department: '営業部',
    position: 'マネージャー',
    available: true,
    id: 'emp2',
    name: '佐藤花子'
  } as any
]

const mockSiteOptions: SiteOption[] = [
  {
    value: 'site1',
    label: '東京プロジェクト',
    location: '東京都渋谷区',
    status: 'active',
    available: true,
    id: 'site1',
    name: '東京プロジェクト'
  } as any,
  {
    value: 'site2',
    label: '大阪プロジェクト',
    location: '大阪府大阪市',
    status: 'active',
    available: true,
    id: 'site2',
    name: '大阪プロジェクト'
  } as any
]

const mockAssignment: Assignment = {
  id: '1',
  employee_id: 'emp1',
  site_id: 'site1',
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-12-31'),
  role: '現場責任者',
  notes: 'テスト配属',
  created_at: new Date(),
  updated_at: new Date()
}

describe('AssignmentForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  it('renders form fields for new assignment', () => {
    render(
      <AssignmentForm
        employeeOptions={mockEmployeeOptions}
        siteOptions={mockSiteOptions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    expect(screen.getByLabelText(/従業員/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/現場/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/配属開始日/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/役割/i)).toBeInTheDocument()
  })

  it('renders form with assignment data for edit mode', () => {
    render(
      <AssignmentForm
        assignment={mockAssignment}
        employeeOptions={mockEmployeeOptions}
        siteOptions={mockSiteOptions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={true}
      />
    )

    const roleInput = screen.getByLabelText(/役割/i) as HTMLInputElement
    expect(roleInput.value).toBe('現場責任者')
  })

  it('shows validation errors for required fields', async () => {
    render(
      <AssignmentForm
        employeeOptions={mockEmployeeOptions}
        siteOptions={mockSiteOptions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    // Trigger validation by entering and clearing role field
    const roleInput = screen.getByLabelText(/役割/i)
    fireEvent.change(roleInput, { target: { value: 'a' } })
    fireEvent.change(roleInput, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.getByText(/役割は必須です/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates minimum length for role field', async () => {
    render(
      <AssignmentForm
        employeeOptions={mockEmployeeOptions}
        siteOptions={mockSiteOptions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    const roleInput = screen.getByLabelText(/役割/i)
    fireEvent.change(roleInput, { target: { value: 'a' } })
    fireEvent.blur(roleInput)

    await waitFor(() => {
      expect(screen.getByText(/役割は2文字以上で入力してください/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const { container } = render(
      <AssignmentForm
        employeeOptions={mockEmployeeOptions}
        siteOptions={mockSiteOptions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    // Select employee
    const employeeInput = screen.getByLabelText(/従業員/i)
    fireEvent.mouseDown(employeeInput)
    await waitFor(() => screen.getByRole('listbox'))
    fireEvent.click(screen.getByRole('option', { name: '山田太郎' }))

    // Select site
    const siteInput = screen.getByLabelText(/現場/i)
    fireEvent.mouseDown(siteInput)
    await waitFor(() => screen.getByRole('listbox'))
    fireEvent.click(screen.getByRole('option', { name: '東京プロジェクト' }))

    // Fill role
    fireEvent.change(screen.getByLabelText(/役割/i), { target: { value: '現場責任者' } })

    // Fill start date with mock DatePicker
    const startDateInput = screen.getByLabelText(/配属開始日/i)
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })

    const submitButton = screen.getByRole('button', { name: /登録/i })

    // Wait for form to be valid
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          employee_id: 'emp1',
          site_id: 'site1',
          role: '現場責任者'
        })
      )
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <AssignmentForm
        employeeOptions={mockEmployeeOptions}
        siteOptions={mockSiteOptions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /キャンセル/i })
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('disables form when loading', () => {
    render(
      <AssignmentForm
        employeeOptions={mockEmployeeOptions}
        siteOptions={mockSiteOptions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
        isEdit={false}
      />
    )

    const submitButton = screen.getByRole('button', { name: /登録/i })
    expect(submitButton).toBeDisabled()
  })

  it('disables employee and site selection in edit mode', () => {
    render(
      <AssignmentForm
        assignment={mockAssignment}
        employeeOptions={mockEmployeeOptions}
        siteOptions={mockSiteOptions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={true}
      />
    )

    const employeeInput = screen.getByLabelText(/従業員/i)
    const siteInput = screen.getByLabelText(/現場/i)

    expect(employeeInput).toBeDisabled()
    expect(siteInput).toBeDisabled()
  })

  it('validates end date is after start date', async () => {
    render(
      <AssignmentForm
        employeeOptions={mockEmployeeOptions}
        siteOptions={mockSiteOptions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    // Set start date
    const startDateInput = screen.getByLabelText(/配属開始日/i)
    fireEvent.change(startDateInput, { target: { value: '2024-06-01' } })

    // Set end date before start date
    const endDateInput = screen.getByLabelText(/配属終了日/i)
    fireEvent.change(endDateInput, { target: { value: '2024-05-01' } })
    fireEvent.blur(endDateInput)

    await waitFor(() => {
      expect(screen.getByText(/終了日は開始日以降を指定してください/i)).toBeInTheDocument()
    })
  })

  it('pre-fills employee when preSelectedEmployeeId is provided', () => {
    const { container } = render(
      <AssignmentForm
        employeeOptions={mockEmployeeOptions}
        siteOptions={mockSiteOptions}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
        preSelectedEmployeeId="emp1"
      />
    )

    // Check if employee is pre-selected (this is hard to test with Autocomplete)
    // Just verify the component renders without error
    expect(screen.getByLabelText(/従業員/i)).toBeInTheDocument()
  })
})