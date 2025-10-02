import React from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material'
import LoginForm from '../components/auth/LoginForm'

export const LoginPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.grey[100],
        padding: theme.spacing(2)
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={isMobile ? 0 : 3}
          sx={{
            padding: theme.spacing(4),
            borderRadius: isMobile ? 0 : theme.spacing(2),
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                mb: 1
              }}
            >
              従業員管理システム
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              ログインしてシステムをご利用ください
            </Typography>
          </Box>

          <LoginForm />

          <Box
            sx={{
              mt: 4,
              textAlign: 'center',
              borderTop: `1px solid ${theme.palette.divider}`,
              pt: 2
            }}
          >
            <Typography variant="caption" color="text.secondary">
              © 2024 従業員管理システム. All rights reserved.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}