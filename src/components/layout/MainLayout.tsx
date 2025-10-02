import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  Box,
  Toolbar,
  useTheme,
  useMediaQuery,
  CssBaseline
} from '@mui/material'
import Header from './Header'
import Navigation from './Navigation'

const DRAWER_WIDTH = 280

const MainLayout: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleDesktopToggle = () => {
    setDesktopOpen(!desktopOpen)
  }

  const handleMobileClose = () => {
    setMobileOpen(false)
  }

  const drawerOpen = isMobile ? mobileOpen : desktopOpen

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <Header
        onMenuToggle={isMobile ? handleMobileToggle : handleDesktopToggle}
        drawerWidth={DRAWER_WIDTH}
      />

      <Navigation
        open={drawerOpen}
        onClose={handleMobileClose}
        drawerWidth={DRAWER_WIDTH}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile ? '100%' : `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)`,
          minHeight: '100vh',
          backgroundColor: theme.palette.grey[50],
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          })
        }}
      >
        <Toolbar />

        <Box
          sx={{
            padding: {
              xs: theme.spacing(2),
              sm: theme.spacing(3),
              md: theme.spacing(4)
            },
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          <Outlet />
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            mt: 'auto',
            py: 2,
            px: 3,
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              fontSize: '0.875rem',
              color: theme.palette.text.secondary
            }}
          >
            © 2024 従業員管理システム. All rights reserved.
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MainLayout