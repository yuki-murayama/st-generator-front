import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
  useTheme
} from '@mui/material'
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material'

interface BreadcrumbItem {
  label: string
  path?: string
  icon?: React.ReactElement
}

interface BreadcrumbProps {
  items?: { label: string; href?: string }[]
  customItems?: BreadcrumbItem[]
  maxItems?: number
  showHome?: boolean
}

// Route configuration for breadcrumb generation
const routeConfig: Record<string, BreadcrumbItem> = {
  '/dashboard': {
    label: 'ダッシュボード',
    icon: <HomeIcon sx={{ fontSize: 16 }} />
  },
  '/employees': {
    label: '従業員管理'
  },
  '/employees/new': {
    label: '新規従業員登録'
  },
  '/employees/:id': {
    label: '従業員詳細'
  },
  '/employees/:id/edit': {
    label: '従業員編集'
  },
  '/sites': {
    label: '現場管理'
  },
  '/sites/new': {
    label: '新規現場登録'
  },
  '/sites/:id': {
    label: '現場詳細'
  },
  '/sites/:id/edit': {
    label: '現場編集'
  },
  '/assignments': {
    label: '配属管理'
  },
  '/assignments/new': {
    label: '新規配属'
  },
  '/assignments/:id': {
    label: '配属詳細'
  },
  '/assignments/:id/edit': {
    label: '配属編集'
  },
  '/profile': {
    label: 'プロフィール'
  },
  '/settings': {
    label: '設定'
  }
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  customItems,
  maxItems = 8,
  showHome = true
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // Handle items prop (convert to BreadcrumbItem format)
    if (items) {
      return items.map(item => ({
        label: item.label,
        path: item.href
      }))
    }

    if (customItems) {
      return customItems
    }

    const pathnames = location.pathname.split('/').filter(x => x)
    const breadcrumbs: BreadcrumbItem[] = []

    // Add home breadcrumb if requested and not on home page
    if (showHome && location.pathname !== '/dashboard') {
      breadcrumbs.push({
        label: 'ホーム',
        path: '/dashboard',
        icon: <HomeIcon sx={{ fontSize: 16 }} />
      })
    }

    // Build breadcrumbs from path segments
    let currentPath = ''

    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Check for exact match first
      let routeInfo = routeConfig[currentPath]

      // If no exact match, check for parameter routes
      if (!routeInfo) {
        // Try to match parameter routes like /employees/:id
        const parameterizedPath = pathnames
          .slice(0, index + 1)
          .map((seg, i) => {
            // If this segment looks like an ID (UUID, number, etc.), replace with :id
            if (i > 0 && /^[a-f0-9-]{36}$|^\d+$/.test(seg)) {
              return ':id'
            }
            return seg
          })
          .join('/')

        routeInfo = routeConfig[`/${parameterizedPath}`]
      }

      if (routeInfo) {
        const isLast = index === pathnames.length - 1

        breadcrumbs.push({
          label: routeInfo.label,
          path: isLast ? undefined : currentPath,
          icon: routeInfo.icon
        })
      } else {
        // Fallback: create breadcrumb from segment name
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        const isLast = index === pathnames.length - 1

        breadcrumbs.push({
          label,
          path: isLast ? undefined : currentPath
        })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Breadcrumbs
        maxItems={maxItems}
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="パンくずリスト"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: theme.palette.text.secondary,
            mx: 1
          }
        }}
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1

          if (isLast || !item.path) {
            return (
              <Typography
                key={index}
                color="text.primary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontWeight: isLast ? 'bold' : 'normal',
                  fontSize: '0.875rem'
                }}
              >
                {item.icon}
                {item.label}
              </Typography>
            )
          }

          return (
            <Link
              key={index}
              component="button"
              variant="body2"
              onClick={() => handleNavigate(item.path!)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                color: theme.palette.primary.main,
                cursor: 'pointer',
                fontSize: '0.875rem',
                border: 'none',
                background: 'none',
                padding: 0,
                '&:hover': {
                  textDecoration: 'underline'
                },
                '&:focus': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                  borderRadius: 1
                }
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </Breadcrumbs>
    </Box>
  )
}

export default Breadcrumb