import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Box,
  Stack
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import {
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import { Assignment, CreateAssignmentData, UpdateAssignmentData, EmployeeOption, SiteOption } from '../../types/assignment'

interface AssignmentFormProps {
  assignment?: Assignment
  employeeOptions: EmployeeOption[]
  siteOptions: SiteOption[]
  onSubmit: (data: CreateAssignmentData | UpdateAssignmentData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  isEdit: boolean
  preSelectedEmployeeId?: string
  preSelectedSiteId?: string
}

interface FormData {
  employee_id: string
  site_id: string
  start_date: Date | null
  end_date: Date | null
  role: string
  notes?: string
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  assignment,
  employeeOptions,
  siteOptions,
  onSubmit,
  onCancel,
  isLoading,
  isEdit,
  preSelectedEmployeeId,
  preSelectedSiteId
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      employee_id: preSelectedEmployeeId || '',
      site_id: preSelectedSiteId || '',
      start_date: null,
      end_date: null,
      role: '',
      notes: ''
    }
  })

  const startDate = watch('start_date')

  useEffect(() => {
    if (assignment && isEdit) {
      reset({
        employee_id: assignment.employee_id,
        site_id: assignment.site_id,
        start_date: assignment.start_date ? new Date(assignment.start_date) : null,
        end_date: assignment.end_date ? new Date(assignment.end_date) : null,
        role: assignment.role || '',
        notes: assignment.notes || ''
      })
    }
  }, [assignment, isEdit, reset])

  const handleFormSubmit = async (data: FormData) => {
    const submitData = {
      employee_id: data.employee_id,
      site_id: data.site_id,
      start_date: data.start_date,
      end_date: data.end_date,
      role: data.role,
      notes: data.notes || undefined
    }

    await onSubmit(submitData as CreateAssignmentData | UpdateAssignmentData)
  }

  const getEmployeeById = (id: string) => employeeOptions.find(emp => emp.value === id)
  const getSiteById = (id: string) => siteOptions.find(site => site.value === id)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isEdit ? '配属情報編集' : '配属新規登録'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <Grid container spacing={3} mt={1}>
            {/* 従業員選択 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="employee_id"
                control={control}
                rules={{ required: '従業員は必須です' }}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={employeeOptions}
                    getOptionLabel={(option) => option.label}
                    value={getEmployeeById(value) || null}
                    onChange={(_, newValue) => {
                      onChange(newValue?.value || '')
                    }}
                    disabled={isLoading || isEdit}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="従業員"
                        required
                        error={!!errors.employee_id}
                        helperText={errors.employee_id?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* 現場選択 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="site_id"
                control={control}
                rules={{ required: '現場は必須です' }}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={siteOptions}
                    getOptionLabel={(option) => option.label}
                    value={getSiteById(value) || null}
                    onChange={(_, newValue) => {
                      onChange(newValue?.value || '')
                    }}
                    disabled={isLoading || isEdit}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="現場"
                        required
                        error={!!errors.site_id}
                        helperText={errors.site_id?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* 配属開始日 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="start_date"
                control={control}
                rules={{ required: '配属開始日は必須です' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="配属開始日"
                    disabled={isLoading}
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        error: !!errors.start_date,
                        helperText: errors.start_date?.message
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* 配属終了日 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="end_date"
                control={control}
                rules={{
                  validate: (value) => {
                    if (!value || !startDate) return true
                    return value >= startDate || '終了日は開始日以降を指定してください'
                  }
                }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="配属終了日（予定）"
                    disabled={isLoading}
                    minDate={startDate || undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.end_date,
                        helperText: errors.end_date?.message
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* 役割 */}
            <Grid item xs={12}>
              <Controller
                name="role"
                control={control}
                rules={{
                  required: '役割は必須です',
                  minLength: {
                    value: 2,
                    message: '役割は2文字以上で入力してください'
                  },
                  maxLength: {
                    value: 100,
                    message: '役割は100文字以内で入力してください'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="役割"
                    required
                    fullWidth
                    placeholder="例: 現場責任者、作業員、技術指導員"
                    error={!!errors.role}
                    helperText={errors.role?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* 備考 */}
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                rules={{
                  maxLength: {
                    value: 500,
                    message: '備考は500文字以内で入力してください'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="備考"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* ボタン */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isLoading || !isValid}
                >
                  {isEdit ? '更新' : '登録'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}