import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Typography,
  Link
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { useAuth } from '../../hooks/useAuth'

interface LoginFormData {
  email: string
  password: string
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, loading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const onSubmit = async (data: LoginFormData) => {
    clearError()

    const { error: signInError } = await signIn(data)

    if (!signInError) {
      navigate(from, { replace: true })
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const isLoading = loading || isSubmitting

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      <Controller
        name="email"
        control={control}
        rules={{
          required: 'メールアドレスを入力してください',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '有効なメールアドレスを入力してください'
          }
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="メールアドレス"
            type="email"
            variant="outlined"
            margin="normal"
            disabled={isLoading}
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color={errors.email ? 'error' : 'action'} />
                </InputAdornment>
              )
            }}
            autoComplete="email"
            autoFocus
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        rules={{
          required: 'パスワードを入力してください',
          minLength: {
            value: 6,
            message: 'パスワードは6文字以上で入力してください'
          }
        }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="パスワード"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            disabled={isLoading}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color={errors.password ? 'error' : 'action'} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="パスワードの表示切替"
                    onClick={handleTogglePasswordVisibility}
                    disabled={isLoading}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            autoComplete="current-password"
          />
        )}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{
          mt: 3,
          mb: 2,
          height: 48,
          fontSize: '1.1rem'
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            <span>ログイン中...</span>
          </Box>
        ) : (
          'ログイン'
        )}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          アカウントをお持ちでない場合は{' '}
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => navigate('/register')}
            disabled={isLoading}
            sx={{ textDecoration: 'underline' }}
          >
            新規登録
          </Link>
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Link
          component="button"
          type="button"
          variant="body2"
          onClick={() => navigate('/forgot-password')}
          disabled={isLoading}
          color="text.secondary"
          sx={{ textDecoration: 'underline' }}
        >
          パスワードを忘れた場合
        </Link>
      </Box>
    </Box>
  )
}

export default LoginForm