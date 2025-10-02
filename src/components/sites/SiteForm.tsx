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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import {
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import dayjs, { Dayjs } from 'dayjs'
import { Site, CreateSiteData, UpdateSiteData } from '../../types/site'

interface SiteFormProps {
  site?: Site
  onSubmit: (data: CreateSiteData | UpdateSiteData) => Promise<void>
  onCancel: () => void
  isLoading: boolean
  isEdit: boolean
}

interface FormData {
  name: string
  location: string
  manager_name: string
  start_date: Dayjs | null
  end_date: Dayjs | null
  status: 'active' | 'completed' | 'suspended'
  description?: string
}

const LOCATIONS = [
  '東京都千代田区',
  '東京都中央区',
  '東京都港区',
  '東京都新宿区',
  '東京都渋谷区',
  '東京都品川区',
  '東京都目黒区',
  '大阪府大阪市',
  '愛知県名古屋市',
  '福岡県福岡市',
  '北海道札幌市',
  '宮城県仙台市'
]

const STATUSES = [
  { value: 'active', label: '進行中' },
  { value: 'completed', label: '完了' },
  { value: 'suspended', label: '中断' }
]

export const SiteForm: React.FC<SiteFormProps> = ({
  site,
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
      name: '',
      location: '',
      manager_name: '',
      start_date: null,
      end_date: null,
      status: 'active',
      description: ''
    }
  })

  useEffect(() => {
    if (site && isEdit) {
      reset({
        name: site.name,
        location: site.location,
        manager_name: site.manager_name,
        start_date: site.start_date ? dayjs(site.start_date) : null,
        end_date: site.end_date ? dayjs(site.end_date) : null,
        status: site.status,
        description: site.description || ''
      })
    }
  }, [site, isEdit, reset])

  const handleFormSubmit = async (data: FormData) => {
    const submitData = {
      name: data.name,
      location: data.location,
      manager_name: data.manager_name,
      start_date: data.start_date?.toISOString(),
      end_date: data.end_date?.toISOString(),
      status: data.status,
      description: data.description || undefined
    }

    await onSubmit(submitData as CreateSiteData | UpdateSiteData)
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isEdit ? '現場情報編集' : '現場新規登録'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <Grid container spacing={3} mt={1}>
            {/* 現場名 */}
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: '現場名は必須です',
                  minLength: {
                    value: 2,
                    message: '現場名は2文字以上で入力してください'
                  },
                  maxLength: {
                    value: 100,
                    message: '現場名は100文字以内で入力してください'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="現場名"
                    required
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* 所在地 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="location"
                control={control}
                rules={{ required: '所在地は必須です' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.location} disabled={isLoading}>
                    <InputLabel required>所在地</InputLabel>
                    <Select {...field} label="所在地">
                      {LOCATIONS.map((location) => (
                        <MenuItem key={location} value={location}>
                          {location}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.location && (
                      <FormHelperText>{errors.location.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* 現場責任者 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="manager_name"
                control={control}
                rules={{
                  required: '現場責任者は必須です',
                  minLength: {
                    value: 2,
                    message: '現場責任者は2文字以上で入力してください'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="現場責任者"
                    required
                    fullWidth
                    error={!!errors.manager_name}
                    helperText={errors.manager_name?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            {/* 開始日 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="start_date"
                control={control}
                rules={{ required: '開始日は必須です' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="開始日"
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

            {/* 終了日 */}
            <Grid item xs={12} md={6}>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="終了日（予定）"
                    disabled={isLoading}
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

            {/* ステータス */}
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'ステータスは必須です' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status} disabled={isLoading}>
                    <InputLabel required>ステータス</InputLabel>
                    <Select {...field} label="ステータス">
                      {STATUSES.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && (
                      <FormHelperText>{errors.status.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* 備考 */}
            <Grid item xs={12}>
              <Controller
                name="description"
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
                    error={!!errors.description}
                    helperText={errors.description?.message}
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