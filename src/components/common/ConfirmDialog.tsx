import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { ConfirmDialogProps } from '../../types'

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
  severity = 'info'
}) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const getSeverityIcon = () => {
    switch (severity) {
      case 'warning':
        return <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 48 }} />
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 48 }} />
      case 'info':
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main, fontSize: 48 }} />
    }
  }

  const getSeverityColor = () => {
    switch (severity) {
      case 'warning':
        return theme.palette.warning.main
      case 'error':
        return theme.palette.error.main
      case 'info':
      default:
        return theme.palette.info.main
    }
  }

  const getConfirmButtonProps = () => {
    switch (severity) {
      case 'warning':
        return {
          color: 'warning' as const,
          variant: 'contained' as const
        }
      case 'error':
        return {
          color: 'error' as const,
          variant: 'contained' as const
        }
      case 'info':
      default:
        return {
          color: 'primary' as const,
          variant: 'contained' as const
        }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: fullScreen ? 0 : 2
        }
      }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: getSeverityColor(),
          fontWeight: 'bold'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getSeverityIcon()}
          <span>{title}</span>
        </Box>
        <IconButton
          aria-label="ダイアログを閉じる"
          onClick={onCancel}
          size="small"
          sx={{
            color: theme.palette.grey[500],
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 3,
          pb: 2
        }}
      >
        <DialogContentText
          id="confirm-dialog-description"
          sx={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: theme.palette.text.primary
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{
          padding: theme.spacing(2, 3),
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 1
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          color="inherit"
          sx={{
            minWidth: 100,
            textTransform: 'none'
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          {...getConfirmButtonProps()}
          sx={{
            minWidth: 100,
            textTransform: 'none'
          }}
          autoFocus={severity !== 'error'} // Don't auto-focus destructive actions
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog