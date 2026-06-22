import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSnackbar } from 'notistack'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Chip,
} from '@mui/material'
import { Visibility, VisibilityOff, Security } from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/services'

const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

type LoginFormInputs = yup.InferType<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const { login, isAuthenticated } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormInputs) => {
    setSubmitting(true)
    try {
      const response = await authApi.login(data.username, data.password)
      const authData = response.data
      
      // Store tokens and set user in Zustand store
      login(
        {
          id: authData.userId,
          username: authData.username,
          fullName: authData.fullName,
          email: authData.email,
          role: authData.role,
        },
        authData.accessToken,
        authData.refreshToken
      )
      
      enqueueSnackbar('Logged in successfully', { variant: 'success' })
      navigate('/dashboard')
    } catch (error: any) {
      if (error.code === 'ECONNABORTED' || !error.response) {
        enqueueSnackbar('Cannot connect to server. Is the backend running?', {
          variant: 'error',
        })
      } else if (error.response?.status === 401) {
        enqueueSnackbar('Invalid username or password', { variant: 'error' })
      } else if (error.response?.status === 403) {
        enqueueSnackbar('Account disabled. Contact administrator.', {
          variant: 'error',
        })
      } else {
        const errorMsg = error.response?.data?.message || 'Login failed. Please try again.'
        enqueueSnackbar(errorMsg, { variant: 'error' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, #0f172a 0%, #020617 100%)',
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          borderRadius: 3,
          backgroundColor: '#111827',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo / Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                borderRadius: 2,
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                mb: 2,
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.35)',
              }}
            >
              <Security sx={{ fontSize: '1.8rem' }} />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 0.5 }}>
              ITSM-Pro Portal
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Sign in to manage IT service operations
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              autoComplete="username"
              autoFocus
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0a0f1e',
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#94a3b8' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0a0f1e',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={submitting}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.25,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                },
              }}
            >
              {submitting ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Credentials Hint */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>
              Demo Credentials
            </Typography>
            <Chip
              label="Demo: admin / admin123"
              size="small"
              sx={{
                backgroundColor: 'rgba(148, 163, 184, 0.08)',
                color: '#94a3b8',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                fontWeight: 500,
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
