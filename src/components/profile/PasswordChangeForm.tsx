import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  Box
} from '@mui/material'
import {
  Save as SaveIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'

interface PasswordFormData {
  current_password: string
  new_password: string
  confirm_password: string
}

interface PasswordChangeFormProps {
  onSave?: (currentPassword: string, newPassword: string) => Promise<void>
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onSave }) => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<PasswordFormData>({
    mode: 'onChange',
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  })

  const newPassword = watch('new_password')

  const handleFormSubmit = async (data: PasswordFormData) => {
    setError(null)
    setSuccess(null)

    try {
      if (onSave) {
        await onSave(data.current_password, data.new_password)
      }
      setSuccess('パスワードを変更しました')
      reset()
    } catch (err: any) {
      console.error('Failed to change password:', err)
      setError(err.message || 'パスワードの変更に失敗しました')
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6">パスワード変更</Typography>

          {/* Success Alert */}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
            <Stack spacing={3}>
              {/* Current Password */}
              <Controller
                name="current_password"
                control={control}
                rules={{
                  required: '現在のパスワードは必須です'
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="現在のパスワード"
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    fullWidth
                    error={!!errors.current_password}
                    helperText={errors.current_password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              {/* New Password */}
              <Controller
                name="new_password"
                control={control}
                rules={{
                  required: '新しいパスワードは必須です',
                  minLength: {
                    value: 8,
                    message: 'パスワードは8文字以上で入力してください'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'パスワードは大文字、小文字、数字を含む必要があります'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="新しいパスワード"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    fullWidth
                    error={!!errors.new_password}
                    helperText={
                      errors.new_password?.message ||
                      '8文字以上、大文字・小文字・数字を含む'
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              {/* Confirm Password */}
              <Controller
                name="confirm_password"
                control={control}
                rules={{
                  required: 'パスワードの確認は必須です',
                  validate: (value) =>
                    value === newPassword || 'パスワードが一致しません'
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="新しいパスワード（確認）"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    fullWidth
                    error={!!errors.confirm_password}
                    helperText={errors.confirm_password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              {/* Save Button */}
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={!isValid}
                >
                  パスワードを変更
                </Button>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}