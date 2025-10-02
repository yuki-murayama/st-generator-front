import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  Button,
  Alert
} from '@mui/material'
import {
  Logout as LogoutIcon
} from '@mui/icons-material'
import Breadcrumb from '../components/navigation/Breadcrumb'
import { ProfileSettings } from '../components/profile/ProfileSettings'
import { PasswordChangeForm } from '../components/profile/PasswordChangeForm'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleProfileSave = async (data: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: data.display_name
        }
      })
      if (error) throw error
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      throw new Error('プロフィール情報の更新に失敗しました')
    }
  }

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error
    } catch (err: any) {
      console.error('Failed to change password:', err)
      throw new Error(err.message || 'パスワードの変更に失敗しました')
    }
  }

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      await signOut()
      setLogoutDialogOpen(false)
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Failed to logout:', error)
      setError('ログアウトに失敗しました')
    }
  }

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false)
  }

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: 'プロフィール' }
  ]

  return (
    <Box p={3}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Breadcrumb items={breadcrumbItems} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
          >
            <Typography variant="h4" component="h1">
              プロフィール設定
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogoutClick}
            >
              ログアウト
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="プロフィール" />
            <Tab label="パスワード変更" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <ProfileSettings onSave={handleProfileSave} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <PasswordChangeForm onSave={handlePasswordChange} />
        </TabPanel>
      </Stack>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={logoutDialogOpen}
        title="ログアウトの確認"
        message="ログアウトしてもよろしいですか？"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        confirmText="ログアウト"
        cancelText="キャンセル"
        severity="warning"
      />
    </Box>
  )
}