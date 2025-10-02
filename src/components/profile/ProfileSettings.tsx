import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert
} from '@mui/material'
import {
  Save as SaveIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'

interface ProfileFormData {
  display_name: string
  email: string
  language: 'ja' | 'en'
  theme: 'light' | 'dark' | 'auto'
}

interface ProfileSettingsProps {
  onSave?: (data: ProfileFormData) => Promise<void>
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSave }) => {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty }
  } = useForm<ProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      display_name: user?.user_metadata?.display_name || '',
      email: user?.email || '',
      language: 'ja',
      theme: 'light'
    }
  })

  const handleFormSubmit = async (data: ProfileFormData) => {
    setError(null)
    setSuccess(null)

    try {
      if (onSave) {
        await onSave(data)
      }
      setSuccess('プロフィール情報を更新しました')
    } catch (err) {
      console.error('Failed to update profile:', err)
      setError('プロフィール情報の更新に失敗しました')
    }
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          {/* Profile Header */}
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: 32
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || <AccountIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {user?.user_metadata?.display_name || 'ユーザー'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || 'メールアドレス未設定'}
              </Typography>
            </Box>
          </Box>

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
              {/* Display Name */}
              <Controller
                name="display_name"
                control={control}
                rules={{
                  required: '表示名は必須です',
                  minLength: {
                    value: 2,
                    message: '表示名は2文字以上で入力してください'
                  },
                  maxLength: {
                    value: 50,
                    message: '表示名は50文字以内で入力してください'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="表示名"
                    required
                    fullWidth
                    error={!!errors.display_name}
                    helperText={errors.display_name?.message}
                  />
                )}
              />

              {/* Email (Read-only) */}
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="メールアドレス"
                    fullWidth
                    disabled
                    helperText="メールアドレスは変更できません"
                  />
                )}
              />

              {/* Language */}
              <Controller
                name="language"
                control={control}
                rules={{ required: '言語設定は必須です' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.language}>
                    <InputLabel required>言語設定</InputLabel>
                    <Select {...field} label="言語設定">
                      <MenuItem value="ja">日本語</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                    </Select>
                    {errors.language && (
                      <FormHelperText>{errors.language.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              {/* Theme */}
              <Controller
                name="theme"
                control={control}
                rules={{ required: 'テーマは必須です' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.theme}>
                    <InputLabel required>テーマ</InputLabel>
                    <Select {...field} label="テーマ">
                      <MenuItem value="light">ライト</MenuItem>
                      <MenuItem value="dark">ダーク</MenuItem>
                      <MenuItem value="auto">システム設定に従う</MenuItem>
                    </Select>
                    {errors.theme && (
                      <FormHelperText>{errors.theme.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              {/* Save Button */}
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={!isValid || !isDirty}
                >
                  保存
                </Button>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}