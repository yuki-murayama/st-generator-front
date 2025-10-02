import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EmployeeForm } from './EmployeeForm'
import { Employee } from '../../types'

const mockEmployee: Employee = {
  id: '1',
  first_name: '太郎',
  last_name: '山田',
  email: 'yamada@example.com',
  phone: '090-1234-5678',
  department: '開発部',
  position: 'エンジニア',
  hire_date: new Date('2024-01-01'),
  status: 'active',
  created_at: new Date(),
  updated_at: new Date()
}

describe('EmployeeForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  it('renders form fields for new employee', () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    expect(screen.getByLabelText(/名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/姓/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/電話番号/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/入社日/i)).toBeInTheDocument()

    // Select components use labels but not aria-labelledby, so check by text
    expect(screen.getAllByText(/部署/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/役職/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/在籍状況/i)[0]).toBeInTheDocument()
  })

  it('renders form with employee data for edit mode', () => {
    render(
      <EmployeeForm
        employee={mockEmployee}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={true}
      />
    )

    const firstNameInput = screen.getByLabelText(/名/i) as HTMLInputElement
    const lastNameInput = screen.getByLabelText(/姓/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/メールアドレス/i) as HTMLInputElement

    expect(firstNameInput.value).toBe('太郎')
    expect(lastNameInput.value).toBe('山田')
    expect(emailInput.value).toBe('yamada@example.com')
  })

  it('shows validation errors for required fields', async () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    // Trigger validation by entering then clearing fields (mode: 'onChange')
    const firstNameInput = screen.getByLabelText(/名/i)
    const lastNameInput = screen.getByLabelText(/姓/i)
    const emailInput = screen.getByLabelText(/メールアドレス/i)

    // Enter and clear first name
    fireEvent.change(firstNameInput, { target: { value: 'a' } })
    fireEvent.change(firstNameInput, { target: { value: '' } })

    // Enter and clear last name
    fireEvent.change(lastNameInput, { target: { value: 'a' } })
    fireEvent.change(lastNameInput, { target: { value: '' } })

    // Enter and clear email
    fireEvent.change(emailInput, { target: { value: 'a' } })
    fireEvent.change(emailInput, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.getByText(/名は必須です/i)).toBeInTheDocument()
      expect(screen.getByText(/姓は必須です/i)).toBeInTheDocument()
      expect(screen.getByText(/メールアドレスは必須です/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates email format', async () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText(/正しいメールアドレスを入力してください/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const { container } = render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    // Fill in text fields
    fireEvent.change(screen.getByLabelText(/名/i), { target: { value: '太郎' } })
    fireEvent.change(screen.getByLabelText(/姓/i), { target: { value: '山田' } })
    fireEvent.change(screen.getByLabelText(/メールアドレス/i), { target: { value: 'yamada@example.com' } })
    fireEvent.change(screen.getByLabelText(/入社日/i), { target: { value: '2024-01-01' } })

    // For MUI Select components - find the combobox elements directly
    // Department select
    const allDivs = container.querySelectorAll('[role="combobox"]')
    const departmentDiv = allDivs[0] // First combobox is department
    fireEvent.mouseDown(departmentDiv)
    await waitFor(() => screen.getByRole('listbox'))
    fireEvent.click(screen.getByRole('option', { name: '開発部' }))

    // Position select
    const positionDiv = allDivs[1] // Second combobox is position
    fireEvent.mouseDown(positionDiv)
    await waitFor(() => screen.getByRole('listbox'))
    fireEvent.click(screen.getByRole('option', { name: 'エンジニア' }))

    const submitButton = screen.getByRole('button', { name: /登録/i })

    // Wait for form to be valid
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: '太郎',
          last_name: '山田',
          email: 'yamada@example.com',
          department: '開発部',
          position: 'エンジニア'
        })
      )
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <EmployeeForm
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
      <EmployeeForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
        isEdit={false}
      />
    )

    const submitButton = screen.getByRole('button', { name: /登録/i })
    expect(submitButton).toBeDisabled()
  })

  it('renders department and position select options', async () => {
    render(
      <EmployeeForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    // Check that department and position labels exist
    expect(screen.getAllByText(/部署/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/役職/i)[0]).toBeInTheDocument()

    // Open department select dropdown
    const allLabels = screen.getAllByText(/部署/i)
    const departmentLabel = allLabels[0]
    const departmentContainer = departmentLabel.closest('.MuiFormControl-root')
    if (departmentContainer) {
      const selectDiv = departmentContainer.querySelector('[role="combobox"]')
      if (selectDiv) {
        fireEvent.mouseDown(selectDiv)
        await waitFor(() => {
          expect(screen.getByRole('option', { name: '開発部' })).toBeInTheDocument()
          expect(screen.getByRole('option', { name: '営業部' })).toBeInTheDocument()
        })
      }
    }
  })
})