import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Alert,
  Skeleton,
  Stack
} from '@mui/material'
import Breadcrumb from '../../components/navigation/Breadcrumb'
import { SiteForm } from '../../components/sites/SiteForm'
import { useSite, useCreateSite, useUpdateSite } from '../../hooks/api/useSites'
import { CreateSiteData, UpdateSiteData } from '../../types/site'

export const SiteFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [error, setError] = useState<string | null>(null)

  // API hooks
  const { data: site, isLoading: isLoadingSite, error: siteError } = useSite(id || '', {
    enabled: isEdit
  })
  const createMutation = useCreateSite()
  const updateMutation = useUpdateSite()

  const handleSubmit = async (data: CreateSiteData | UpdateSiteData) => {
    setError(null)

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({
          id,
          ...(data as UpdateSiteData)
        })
        navigate(`/sites/${id}`, { replace: true })
      } else {
        const result = await createMutation.mutateAsync(data as CreateSiteData)
        navigate(`/sites/${result.id}`, { replace: true })
      }
    } catch (err) {
      console.error('Failed to save site:', err)
      setError(isEdit ? '現場の更新に失敗しました' : '現場の登録に失敗しました')
    }
  }

  const handleCancel = () => {
    if (isEdit && id) {
      navigate(`/sites/${id}`)
    } else {
      navigate('/sites')
    }
  }

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: '現場一覧', href: '/sites' },
    { label: isEdit ? (site?.name || '編集') : '新規登録' }
  ]

  if (isEdit && siteError) {
    return (
      <Box p={3}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert severity="error" sx={{ mt: 2 }}>
          現場情報の取得に失敗しました: {siteError.message}
        </Alert>
      </Box>
    )
  }

  if (isEdit && isLoadingSite) {
    return (
      <Box p={3}>
        <Breadcrumb items={breadcrumbItems} />
        <Box mt={2}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Box>
    )
  }

  if (isEdit && !site) {
    return (
      <Box p={3}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert severity="warning" sx={{ mt: 2 }}>
          現場が見つかりません
        </Alert>
      </Box>
    )
  }

  return (
    <Box p={3}>
      <Stack spacing={3}>
        <Box>
          <Breadcrumb items={breadcrumbItems} />
          <Typography variant="h4" component="h1" mt={2}>
            {isEdit ? '現場編集' : '現場新規登録'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <SiteForm
          site={isEdit ? site : undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isEdit={isEdit}
        />
      </Stack>
    </Box>
  )
}