import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSnackbar } from 'notistack'
import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Divider,
  Chip,
} from '@mui/material'
import { AccountCircle, VpnKey, Save } from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import { InfoRow, SectionHeader } from '@/components/common/ItsmComponents'

// Personal Info schema
const infoSchema = yup.object().shape({
  fullName: yup.string().required('Full Name is required'),
  email: yup.string().required('Email is required').email('Must be a valid email address'),
  phone: yup.string().optional(),
  department: yup.string().required('Department is required'),
})

// Change Password schema
const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current Password is required'),
  newPassword: yup
    .string()
    .required('New Password is required')
    .min(8, 'New Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
})

type InfoFormInputs = yup.InferType<typeof infoSchema>
type PasswordFormInputs = yup.InferType<typeof passwordSchema>

export default function ProfilePage() {
  const { enqueueSnackbar } = useSnackbar()
  const { user } = useAuthStore()

  // Form for Personal Info
  const {
    register: registerInfo,
    handleSubmit: handleInfoSubmit,
    formState: { errors: infoErrors, isSubmitting: infoSubmitting },
  } = useForm<InfoFormInputs>({
    resolver: yupResolver(infoSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      phone: '',
      department: user?.department ?? '',
    },
  })

  // Form for Password Reset
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordFormInputs>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onInfoSubmit = async (data: InfoFormInputs) => {
    // Simulate API update
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    // Update local Zustand state to propagate changes across layout
    if (user) {
      const updatedUser = {
        ...user,
        fullName: data.fullName,
        email: data.email,
        department: data.department,
      }
      useAuthStore.setState({ user: updatedUser })
      sessionStorage.setItem('auth_user', JSON.stringify(updatedUser))
    }
    
    enqueueSnackbar('Personal details updated successfully', { variant: 'success' })
  }

  const onPasswordSubmit = async (data: PasswordFormInputs) => {
    // Simulate API update
    await new Promise((resolve) => setTimeout(resolve, 800))
    enqueueSnackbar('Password changed successfully', { variant: 'success' })
    resetPasswordForm()
  }

  if (!user) return null

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Box>
      <SectionHeader
        title="My Profile"
        subtitle="Manage your contact information, security preferences, and operations role settings"
      />

      <Grid container spacing={3}>
        {/* Left Column Identity Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ background: '#111827', textAlign: 'center', p: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 72,
                    height: 72,
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.25)',
                    mb: 2,
                  }}
                >
                  {initials}
                </Avatar>
                <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
                  {user.fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1.5 }}>
                  @{user.username}
                </Typography>
                <Chip
                  label={user.roleName}
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 600, borderRadius: 1 }}
                />
              </Box>

              <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.08)', mb: 2 }} />

              <InfoRow label="Username" value={user.username} />
              <InfoRow label="Email Address" value={user.email} />
              <InfoRow label="Operational Role" value={user.roleName} />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column Form Cards */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Personal Info Form */}
          <Card sx={{ background: '#111827', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AccountCircle color="primary" />
                <Typography variant="subtitle1" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
                  Personal Information
                </Typography>
              </Box>

              <form onSubmit={handleInfoSubmit(onInfoSubmit)} noValidate>
                <Grid container spacing={3.5}>
                  {/* Full Name */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      {...registerInfo('fullName')}
                      error={!!infoErrors.fullName}
                      helperText={infoErrors.fullName?.message}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email Address"
                      {...registerInfo('email')}
                      error={!!infoErrors.email}
                      helperText={infoErrors.email?.message}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Grid>

                  {/* Phone */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...registerInfo('phone')}
                      error={!!infoErrors.phone}
                      helperText={infoErrors.phone?.message}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Grid>

                  {/* Department */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Department"
                      {...registerInfo('department')}
                      error={!!infoErrors.department}
                      helperText={infoErrors.department?.message}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    disabled={infoSubmitting}
                  >
                    {infoSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Form */}
          <Card sx={{ background: '#111827' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <VpnKey color="primary" />
                <Typography variant="subtitle1" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
                  Security & Password
                </Typography>
              </Box>

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
                <Grid container spacing={3}>
                  {/* Current Password */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Current Password"
                      {...registerPassword('currentPassword')}
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword?.message}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Grid>

                  {/* New Password */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      {...registerPassword('newPassword')}
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Grid>

                  {/* Confirm Password */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm New Password"
                      {...registerPassword('confirmPassword')}
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    disabled={passwordSubmitting}
                  >
                    {passwordSubmitting ? 'Updating...' : 'Update Password'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
