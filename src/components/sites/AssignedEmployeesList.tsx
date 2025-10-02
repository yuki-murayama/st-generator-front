import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material'
import {
  Visibility as ViewIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material'
import { SiteWithAssignments } from '../../types/site'

interface AssignedEmployeesListProps {
  site: SiteWithAssignments
  onViewEmployee?: (employeeId: string) => void
}

const formatDate = (date: Date | null | undefined) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const getAssignmentStatus = (startDate: Date, endDate: Date | null) => {
  const now = new Date()
  const start = new Date(startDate)

  if (now < start) {
    return { label: '配属予定', color: 'info' as const }
  }

  if (endDate) {
    const end = new Date(endDate)
    if (now > end) {
      return { label: '配属終了', color: 'default' as const }
    }
  }

  return { label: '配属中', color: 'success' as const }
}

export const AssignedEmployeesList: React.FC<AssignedEmployeesListProps> = ({
  site,
  onViewEmployee
}) => {
  const assignedEmployees = site.assigned_employees || []

  if (assignedEmployees.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            配属従業員
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <Typography variant="body2" color="text.secondary">
              配属されている従業員はいません
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            配属従業員
          </Typography>
          <Chip
            label={`${assignedEmployees.length}名`}
            color="primary"
            size="small"
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>従業員</TableCell>
                <TableCell>開始日</TableCell>
                <TableCell>終了日</TableCell>
                <TableCell align="center">ステータス</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignedEmployees.map((assignment) => {
                const status = getAssignmentStatus(
                  assignment.start_date,
                  assignment.end_date || null
                )

                return (
                  <TableRow key={assignment.assignment_id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {assignment.employee_name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {assignment.employee_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(assignment.start_date)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CalendarIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(assignment.end_date)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {onViewEmployee && (
                        <Tooltip title="従業員詳細を見る">
                          <IconButton
                            size="small"
                            onClick={() => onViewEmployee(assignment.employee_id)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}