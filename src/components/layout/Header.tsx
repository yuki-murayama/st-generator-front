import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Menu as MenuIcon,
  Settings,
  Logout,
  Person
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface HeaderProps {
  onMenuToggle: () => void
  drawerWidth: number
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, drawerWidth }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user, signOut } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleProfileClick = () => {
    handleProfileMenuClose()
    navigate('/profile')
  }

  const handleSettingsClick = () => {
    handleProfileMenuClose()
    navigate('/settings')
  }

  const handleLogout = async () => {
    handleProfileMenuClose()
    await signOut()
    navigate('/login')
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user?.email || 'ユーザー'
  }

  const getUserInitials = () => {
    const firstName = user?.user_metadata?.first_name
    const lastName = user?.user_metadata?.last_name
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const isMenuOpen = Boolean(anchorEl)

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
        ml: isMobile ? 0 : `${drawerWidth}px`,
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.primary.main,
        boxShadow: theme.shadows[4]
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="メニューを開く"
            edge="start"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          従業員管理システム
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" color="inherit">
              {getUserDisplayName()}
            </Typography>
          </Box>

          <IconButton
            size="large"
            edge="end"
            aria-label="ユーザーメニュー"
            aria-controls={isMenuOpen ? 'profile-menu' : undefined}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: theme.palette.secondary.main,
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            >
              {getUserInitials()}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          open={isMenuOpen}
          onClose={handleProfileMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 200,
              mt: 1
            }
          }}
        >
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>プロフィール</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleSettingsClick}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>設定</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>ログアウト</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Header