import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSnackbar } from 'notistack'
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Skeleton,
} from '@mui/material'
import { People, PersonAdd, Block, Edit } from '@mui/icons-material'
import { userApi } from '@/api/services'
import {
  SectionHeader,
  EmptyState,
  ErrorState,
} from '@/components/common/ItsmComponents'
import { formatDate } from '@/utils'
import { UserSummary } from '@/types/index'

interface ExtendedUserSummary extends UserSummary {
  status?: string
  createdAt?: string
  role?: string
  team?: string
  shift?: string
  phone?: string
}

const userSchema = yup.object().shape({
  fullName: yup.string().required('Full Name is required'),
  username: yup
    .string()
    .required('Username is required')
    .matches(
      /^[a-z0-9.-]+$/,
      'Username can only contain lowercase letters, numbers, dots, and dashes'
    ),
  email: yup.string().required('Email is required').email('Must be a valid email address'),
  password: yup.string().optional().test('len', 'Password must be at least 8-chars if provided', (val) => !val || val.length >= 8),
  department: yup.string().required('Department is required'),
  phone: yup.string().optional(),
  roleName: yup.string().required('Role is required'),
  team: yup.string().required('Team selection is required'),
  shift: yup.string().required('Shift is required'),
  status: yup.string().required('Status is required'),
})

type UserFormInputs = yup.InferType<typeof userSchema>

const ROLE_CHIP_COLORS: Record<string, { bg: string; color: string }> = {
  ROLE_ADMIN: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
  ROLE_MANAGER: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
  ROLE_USER: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
}

const TEAMS = [
  'L1 Support',
  'L2 Support',
  'L3 Support',
  'Database Team',
  'Network Team',
  'Security Team',
  'Cloud Team',
]

const SHIFTS = ['Day', 'Night', 'Swing']
const STATUSES = ['ACTIVE', 'OUT_OF_OFFICE', 'INACTIVE']

function TableSkeleton() {
  return (
    <>
      {Array.from(new Array(5)).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {Array.from(new Array(8)).map((_, colIdx) => (
            <TableCell key={colIdx}>
              <Skeleton variant="text" width="60%" height={24} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default function UserManagementPage() {
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  // Pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<ExtendedUserSummary | null>(null)

  // Fetch users query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users-admin-list', page, rowsPerPage],
    queryFn: () => userApi.getAll({ page, size: rowsPerPage }).then((res) => res.data),
  })

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (payload: Parameters<typeof userApi.create>[0]) =>
      userApi.create(payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-admin-list'] })
      enqueueSnackbar('User account created successfully', { variant: 'success' })
      setDialogOpen(false)
      reset()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create user account'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      userApi.update(id, payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-admin-list'] })
      enqueueSnackbar('User account updated successfully', { variant: 'success' })
      setDialogOpen(false)
      setEditingUser(null)
      reset()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update user account'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })

  // Delete/Disable user mutation (Soft delete: set inactive)
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => userApi.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-admin-list'] })
      enqueueSnackbar('User account disabled successfully', { variant: 'success' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to disable user account'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UserFormInputs>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      department: '',
      phone: '',
      roleName: '',
      team: '',
      shift: '',
      status: 'ACTIVE',
    },
  })

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleEditClick = (userRow: ExtendedUserSummary) => {
    setEditingUser(userRow)
    setDialogOpen(true)
    reset({
      fullName: userRow.fullName,
      username: userRow.username,
      email: userRow.email,
      password: '',
      department: userRow.department || '',
      phone: userRow.phone || '',
      roleName: userRow.role || 'ROLE_USER',
      team: userRow.team || '',
      shift: userRow.shift || '',
      status: userRow.status || 'ACTIVE',
    })
  }

  const handleAddClick = () => {
    setEditingUser(null)
    setDialogOpen(true)
    reset({
      fullName: '',
      username: '',
      email: '',
      password: '',
      department: '',
      phone: '',
      roleName: '',
      team: '',
      shift: '',
      status: 'ACTIVE',
    })
  }

  const handleDeleteClick = (id: number) => {
    if (window.confirm('Are you sure you want to disable/deactivate this user?')) {
      deleteUserMutation.mutate(id)
    }
  }

  const onSubmit = (data: UserFormInputs) => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        payload: {
          fullName: data.fullName,
          email: data.email,
          department: data.department,
          phone: data.phone,
          roleName: data.roleName,
          team: data.team,
          shift: data.shift,
          status: data.status,
          password: data.password || undefined,
        },
      })
    } else {
      createUserMutation.mutate(data)
    }
  }

  const users = (data?.content ?? []) as ExtendedUserSummary[]
  const totalElements = data?.totalElements ?? 0

  return (
    <Box>
      {/* Title & Actions */}
      <SectionHeader
        title="User Management"
        subtitle="Provision accounts, assign administrative teams, shifts and track IT specialist workloads"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={handleAddClick}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
            }}
          >
            Add User
          </Button>
        }
      />

      {/* Users directory table */}
      <TableContainer component={Card} sx={{ background: '#111827', boxShadow: 'none' }}>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead sx={{ backgroundColor: 'rgba(148, 163, 184, 0.03)' }}>
            <TableRow>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Team / Shift</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Department</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Workload / SLA</TableCell>
              <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <ErrorState message={error.message} onRetry={refetch} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    title="No users found"
                    subtitle="There are no user accounts in the directory."
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((userRow) => {
                const userRole = userRow.role ?? 'ROLE_USER'
                const roleChip = ROLE_CHIP_COLORS[userRole] || {
                  bg: 'rgba(148, 163, 184, 0.12)',
                  color: '#94a3b8',
                }
                const displayRole = userRole.replace('ROLE_', '')
                const userStatus = userRow.status ?? 'ACTIVE'
                const userTeam = userRow.team || 'Unassigned'
                const userShift = userRow.shift || 'None'

                // Mock workload stats
                const ticketCount = 1 + (userRow.id % 6)
                const slaCompliance = 92 + (userRow.id % 8)

                return (
                  <TableRow key={userRow.id}>
                    {/* Name */}
                    <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                      <Box>
                        {userRow.fullName}
                        <Typography variant="caption" sx={{ display: 'block', color: '#64748b', fontFamily: 'monospace' }}>
                          @{userRow.username}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Team & Shift */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                          {userTeam}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Shift: {userShift}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Email */}
                    <TableCell sx={{ color: '#e2e8f0' }}>{userRow.email}</TableCell>

                    {/* Department */}
                    <TableCell sx={{ color: '#cbd5e1' }}>
                      {userRow.department || '—'}
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Chip
                        label={displayRole}
                        size="small"
                        sx={{
                          backgroundColor: roleChip.bg,
                          color: roleChip.color,
                          fontWeight: 700,
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={userStatus}
                        size="small"
                        color={userStatus === 'ACTIVE' ? 'success' : userStatus === 'OUT_OF_OFFICE' ? 'warning' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: 1 }}
                      />
                    </TableCell>

                    {/* Workload */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ color: ticketCount > 5 ? '#f87171' : '#34d399', fontWeight: 700 }}>
                          {ticketCount} Tickets Active
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          SLA Compliance: {slaCompliance}%
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton
                          size="small"
                          sx={{ color: '#3b82f6' }}
                          onClick={() => handleEditClick(userRow)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: 'error.main' }}
                          onClick={() => handleDeleteClick(userRow.id)}
                          disabled={userStatus === 'INACTIVE'}
                        >
                          <Block fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination controls */}
      {!isLoading && !error && totalElements > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          sx={{
            background: '#111827',
            color: '#94a3b8',
            borderTop: '1px solid rgba(148, 163, 184, 0.08)',
          }}
        />
      )}

      {/* Add / Edit User Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingUser(null)
          reset()
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 700 }}>
          {editingUser ? `Edit User: ${editingUser.fullName}` : 'Create User Account'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              {/* Full Name */}
              <TextField
                required
                fullWidth
                label="Full Name"
                size="small"
                {...register('fullName')}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* Username */}
              <TextField
                required
                fullWidth
                disabled={!!editingUser}
                label="Username"
                size="small"
                placeholder="lowercase letters, numbers, dots, and dashes only"
                {...register('username')}
                error={!!errors.username}
                helperText={errors.username?.message}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* Email */}
              <TextField
                required
                fullWidth
                label="Email"
                type="email"
                size="small"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* Password */}
              <TextField
                required={!editingUser}
                fullWidth
                label={editingUser ? 'Password (Leave blank to keep current)' : 'Password'}
                type="password"
                size="small"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* Department */}
              <TextField
                required
                fullWidth
                label="Department"
                size="small"
                {...register('department')}
                error={!!errors.department}
                helperText={errors.department?.message}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* Phone */}
              <TextField
                fullWidth
                label="Phone"
                size="small"
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* Team Select */}
              <FormControl fullWidth size="small" error={!!errors.team}>
                <InputLabel id="dialog-team-select-label" shrink>Team</InputLabel>
                <Controller
                  name="team"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="dialog-team-select-label"
                      label="Team"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Specialist Team
                      </MenuItem>
                      {TEAMS.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.team?.message}</FormHelperText>
              </FormControl>

              {/* Shift Select */}
              <FormControl fullWidth size="small" error={!!errors.shift}>
                <InputLabel id="dialog-shift-select-label" shrink>Shift</InputLabel>
                <Controller
                  name="shift"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="dialog-shift-select-label"
                      label="Shift"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Shift Duty
                      </MenuItem>
                      {SHIFTS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s} Shift
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.shift?.message}</FormHelperText>
              </FormControl>

              {/* Status Select */}
              <FormControl fullWidth size="small" error={!!errors.status}>
                <InputLabel id="dialog-status-select-label" shrink>Status</InputLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="dialog-status-select-label"
                      label="Status"
                      displayEmpty
                    >
                      {STATUSES.map((st) => (
                        <MenuItem key={st} value={st}>
                          {st}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                <FormHelperText>{errors.status?.message}</FormHelperText>
              </FormControl>

              {/* Role Select */}
              <FormControl fullWidth size="small" error={!!errors.roleName}>
                <InputLabel id="dialog-role-select-label" shrink>Role</InputLabel>
                <Controller
                  name="roleName"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="dialog-role-select-label"
                      label="Role"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Role
                      </MenuItem>
                      <MenuItem value="ROLE_USER">User</MenuItem>
                      <MenuItem value="ROLE_MANAGER">Manager</MenuItem>
                      <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
                    </Select>
                  )}
                />
                <FormHelperText>{errors.roleName?.message}</FormHelperText>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => {
                setDialogOpen(false)
                setEditingUser(null)
                reset()
              }}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {createUserMutation.isPending || updateUserMutation.isPending ? (
                <CircularProgress size={20} />
              ) : editingUser ? (
                'Save Changes'
              ) : (
                'Create User'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
