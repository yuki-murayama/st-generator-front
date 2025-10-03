import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SiteForm } from '@/components/sites/SiteForm'
import { Site } from '@/types/site'

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

const mockSite: Site = {
  id: '1',
  name: '東京プロジェクト',
  location: '東京都渋谷区',
  manager_name: '山田太郎',
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-12-31'),
  status: 'active',
  description: 'テストプロジェクト',
  created_at: new Date(),
  updated_at: new Date()
}

describe('SiteForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSubmit.mockResolvedValue(undefined)
  })

  it('renders form fields for new site', () => {
    render(
      <SiteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    expect(screen.getByLabelText(/現場名/i)).toBeInTheDocument()
    expect(screen.getAllByText(/所在地/i)[0]).toBeInTheDocument()
    expect(screen.getByLabelText(/現場責任者/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/開始日/i)).toBeInTheDocument()
  })

  it('renders form with site data for edit mode', () => {
    render(
      <SiteForm
        site={mockSite}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={true}
      />
    )

    const nameInput = screen.getByLabelText(/現場名/i) as HTMLInputElement
    const managerInput = screen.getByLabelText(/現場責任者/i) as HTMLInputElement

    expect(nameInput.value).toBe('東京プロジェクト')
    expect(managerInput.value).toBe('山田太郎')
  })

  it('shows validation errors for required fields', async () => {
    render(
      <SiteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    // Trigger validation by entering and clearing fields
    const nameInput = screen.getByLabelText(/現場名/i)
    const managerInput = screen.getByLabelText(/現場責任者/i)

    fireEvent.change(nameInput, { target: { value: 'a' } })
    fireEvent.change(nameInput, { target: { value: '' } })

    fireEvent.change(managerInput, { target: { value: 'a' } })
    fireEvent.change(managerInput, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.getByText(/現場名は必須です/i)).toBeInTheDocument()
      expect(screen.getByText(/現場責任者は必須です/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates minimum length for name field', async () => {
    render(
      <SiteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    const nameInput = screen.getByLabelText(/現場名/i)
    fireEvent.change(nameInput, { target: { value: 'a' } })
    fireEvent.blur(nameInput)

    await waitFor(() => {
      expect(screen.getByText(/現場名は2文字以上で入力してください/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const { container } = render(
      <SiteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    // Fill in text fields
    fireEvent.change(screen.getByLabelText(/現場名/i), { target: { value: '東京プロジェクト' } })
    fireEvent.change(screen.getByLabelText(/現場責任者/i), { target: { value: '山田太郎' } })

    // Select location
    const allDivs = container.querySelectorAll('[role="combobox"]')
    const locationDiv = allDivs[0]
    fireEvent.mouseDown(locationDiv)
    await waitFor(() => screen.getByRole('listbox'))
    fireEvent.click(screen.getByRole('option', { name: '東京都渋谷区' }))

    // Fill start date with mock DatePicker
    const startDateInput = screen.getByLabelText(/開始日/i)
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
          name: '東京プロジェクト',
          location: '東京都渋谷区',
          manager_name: '山田太郎'
        })
      )
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <SiteForm
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
      <SiteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
        isEdit={false}
      />
    )

    const submitButton = screen.getByRole('button', { name: /登録/i })
    expect(submitButton).toBeDisabled()
  })

  it('renders location select options', async () => {
    const { container } = render(
      <SiteForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={false}
        isEdit={false}
      />
    )

    expect(screen.getAllByText(/所在地/i)[0]).toBeInTheDocument()

    const allDivs = container.querySelectorAll('[role="combobox"]')
    const locationDiv = allDivs[0]
    fireEvent.mouseDown(locationDiv)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: '東京都渋谷区' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '大阪府大阪市' })).toBeInTheDocument()
    })
  })
})