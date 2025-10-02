import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Stack
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import { Employee, CreateEmployeeData, UpdateEmployeeData } from '../../types'

interface EmployeeFormProps {
  employee?: Employee
  onSubmit: (data: CreateEmployeeData | UpdateEmployeeData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  isEdit: boolean
}

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  department: string
  position: string
  hire_date: string
  status: 'active' | 'inactive'
}

const DEPARTMENTS = [
  '開発部',
  '営業部',
  '管理部',
  '人事部',
  '企画部',
  '経理部',
  'マーケティング部',
  '総務部'
]

const POSITIONS = [
  'エンジニア',
  'シニアエンジニア',
  'テックリード',
  'プロジェクトマネージャー',
  '営業担当',
  '営業主任',
  '部長',
  '課長',
  '主任',
  '担当',
  'プランナー',
  'ディレクター'
]

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  onCancel,
  isLoading,
  isEdit
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      hire_date: new Date().toISOString().split('T')[0],
      status: 'active'
    }
  })

  useEffect(() => {
    if (employee && isEdit) {
      reset({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone || '',
        department: employee.department,
        position: employee.position,
        hire_date: employee.hire_date instanceof Date
          ? employee.hire_date.toISOString().split('T')[0]
          : new Date(employee.hire_date).toISOString().split('T')[0],
        status: employee.status
      })
    }
  }, [employee, isEdit, reset])

  const handleFormSubmit = async (data: FormData) => {
    const submitData = {
      ...data,
      hire_date: new Date(data.hire_date),
      phone: data.phone || null
    }

    await onSubmit(submitData)
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              {isEdit ? '従業員情報編集' : '新規従業員登録'}
            </Typography>

            {/* 基本情報 */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                基本情報
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="last_name"
                    control={control}
                    rules={{
                      required: '姓は必須です',
                      maxLength: { value: 50, message: '姓は50文字以内で入力してください' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="姓"
                        fullWidth
                        required
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="first_name"
                    control={control}
                    rules={{
                      required: '名は必須です',
                      maxLength: { value: 50, message: '名は50文字以内で入力してください' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="名"
                        fullWidth
                        required
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: 'メールアドレスは必須です',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: '正しいメールアドレスを入力してください'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="メールアドレス"
                        type="email"
                        fullWidth
                        required
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      pattern: {
                        value: /^[0-9-+()]+$/,
                        message: '正しい電話番号を入力してください'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="電話番号"
                        fullWidth
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        placeholder="090-1234-5678"
                        disabled={isLoading}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* 勤務情報 */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                勤務情報
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="department"
                    control={control}
                    rules={{ required: '部署は必須です' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.department} disabled={isLoading}>
                        <InputLabel required>部署</InputLabel>
                        <Select
                          {...field}
                          label="部署"
                        >
                          {DEPARTMENTS.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              {dept}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.department && (
                          <FormHelperText>{errors.department.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="position"
                    control={control}
                    rules={{ required: '役職は必須です' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.position} disabled={isLoading}>
                        <InputLabel required>役職</InputLabel>
                        <Select
                          {...field}
                          label="役職"
                        >
                          {POSITIONS.map((pos) => (
                            <MenuItem key={pos} value={pos}>
                              {pos}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.position && (
                          <FormHelperText>{errors.position.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="hire_date"
                    control={control}
                    rules={{ required: '入社日は必須です' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="入社日"
                        type="date"
                        fullWidth
                        required
                        error={!!errors.hire_date}
                        helperText={errors.hire_date?.message}
                        InputLabelProps={{ shrink: true }}
                        disabled={isLoading}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: '在籍状況は必須です' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.status} disabled={isLoading}>
                        <InputLabel required>在籍状況</InputLabel>
                        <Select
                          {...field}
                          label="在籍状況"
                        >
                          <MenuItem value="active">在籍中</MenuItem>
                          <MenuItem value="inactive">退職済み</MenuItem>
                        </Select>
                        {errors.status && (
                          <FormHelperText>{errors.status.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
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
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}