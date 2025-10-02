import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Collapse
} from '@mui/material'
import {
  Dashboard,
  People,
  LocationOn,
  Assignment,
  Settings,
  ExpandLess,
  ExpandMore,
  PersonAdd,
  AddLocation,
  AssignmentInd
} from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'
import { navigationGuards } from '../../utils/authGuards'

interface NavigationProps {
  open: boolean
  onClose: () => void
  drawerWidth: number
}

interface NavigationItem {
  id: string
  label: string
  path: string
  icon: React.ReactElement
  guard?: (user: any) => boolean
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'ダッシュボード',
    path: '/dashboard',
    icon: <Dashboard />,
    guard: navigationGuards.canAccessDashboard
  },
  {
    id: 'employees',
    label: '従業員管理',
    path: '/employees',
    icon: <People />,
    guard: navigationGuards.canViewEmployeeDetails,
    children: [
      {
        id: 'employees-list',
        label: '従業員一覧',
        path: '/employees',
        icon: <People />,
        guard: navigationGuards.canViewEmployeeDetails
      },
      {
        id: 'employees-new',
        label: '新規従業員登録',
        path: '/employees/new',
        icon: <PersonAdd />,
        guard: navigationGuards.canManageEmployees
      }
    ]
  },
  {
    id: 'sites',
    label: '現場管理',
    path: '/sites',
    icon: <LocationOn />,
    guard: navigationGuards.canViewSiteDetails,
    children: [
      {
        id: 'sites-list',
        label: '現場一覧',
        path: '/sites',
        icon: <LocationOn />,
        guard: navigationGuards.canViewSiteDetails
      },
      {
        id: 'sites-new',
        label: '新規現場登録',
        path: '/sites/new',
        icon: <AddLocation />,
        guard: navigationGuards.canManageSites
      }
    ]
  },
  {
    id: 'assignments',
    label: '配属管理',
    path: '/assignments',
    icon: <Assignment />,
    guard: navigationGuards.canManageAssignments,
    children: [
      {
        id: 'assignments-list',
        label: '配属一覧',
        path: '/assignments',
        icon: <Assignment />,
        guard: navigationGuards.canManageAssignments
      },
      {
        id: 'assignments-new',
        label: '新規配属',
        path: '/assignments/new',
        icon: <AssignmentInd />,
        guard: navigationGuards.canManageAssignments
      }
    ]
  }
]

const Navigation: React.FC<NavigationProps> = ({ open, onClose, drawerWidth }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useAuth()
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['employees', 'sites', 'assignments'])

  const handleItemClick = (item: NavigationItem) => {
    if (item.children) {
      // Toggle expansion for parent items
      setExpandedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      )
    } else {
      // Navigate to the item's path
      navigate(item.path)
      if (isMobile) {
        onClose()
      }
    }
  }

  const isItemActive = (path: string) => {
    return location.pathname === path
  }

  const isParentActive = (item: NavigationItem) => {
    if (item.children) {
      return item.children.some(child => isItemActive(child.path))
    }
    return isItemActive(item.path)
  }

  const renderNavigationItem = (item: NavigationItem, isChild = false) => {
    // Check if user has permission to see this item
    if (item.guard && !item.guard(user)) {
      return null
    }

    const isActive = isItemActive(item.path)
    const isExpanded = expandedItems.includes(item.id)
    const hasActiveChild = isParentActive(item)

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
              pl: isChild ? 4 : 2.5,
              backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
              borderRight: isActive ? `3px solid ${theme.palette.primary.main}` : 'none',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: isActive || hasActiveChild ? theme.palette.primary.main : 'inherit'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                opacity: open ? 1 : 0,
                color: isActive || hasActiveChild ? theme.palette.primary.main : 'inherit',
                fontWeight: isActive ? 'bold' : 'normal'
              }}
            />
            {item.children && open && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>

        {item.children && (
          <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderNavigationItem(child, true))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    )
  }

  const drawerContent = (
    <Box>
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          backgroundColor: theme.palette.primary.dark
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            textAlign: 'center',
            opacity: open ? 1 : 0,
            transition: 'opacity 0.2s'
          }}
        >
          EMS
        </Typography>
      </Box>

      <Divider />

      <List>
        {navigationItems.map(item => renderNavigationItem(item))}
      </List>

      <Divider />

      <List>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => navigate('/settings')}
            sx={{
              minHeight: 48,
              justifyContent: open ? 'initial' : 'center',
              px: 2.5
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center'
              }}
            >
              <Settings />
            </ListItemIcon>
            <ListItemText
              primary="設定"
              sx={{ opacity: open ? 1 : 0 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true // Better performance on mobile
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default
        }
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Navigation