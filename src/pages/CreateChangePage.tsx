import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  Divider,
} from '@mui/material'
import { SwapHoriz, ArrowBack } from '@mui/icons-material'
import { changeApi } from '@/api/services'

const changeSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .min(10, 'Title must be at least 10 characters'),
  description: yup.string().required('Description is required'),
  changeType: yup.string().required('Change type is required'),
  riskLevel: yup.string().required('Risk assessment is required'),
  implementationPlan: yup.string().optional(),
  rollbackPlan: yup.string().optional(),
  testPlan: yup.string().optional(),
  scheduledStart: yup.string().required('Scheduled start is required'),
  scheduledEnd: yup.string().required('Scheduled end is required'),
})

type ChangeFormInputs = yup.InferType<typeof changeSchema>

export default function CreateChangePage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChangeFormInputs>({
    resolver: yupResolver(changeSchema),
    defaultValues: {
      title: '',
      description: '',
      changeType: '',
      riskLevel: '',
      implementationPlan: '',
      rollbackPlan: '',
      testPlan: '',
      scheduledStart: '',
      scheduledEnd: '',
    },
  })

  // Create change request mutation
  const createChangeMutation = useMutation({
    mutationFn: (data: Parameters<typeof changeApi.create>[0]) =>
      changeApi.create(data).then((res) => res.data),
    onSuccess: (newChange) => {
      queryClient.invalidateQueries({ queryKey: ['changes'] })
      enqueueSnackbar('Change request created successfully', { variant: 'success' })
      navigate(`/changes/${newChange.id}`)
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create change request'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })

  const onSubmit = (data: ChangeFormInputs) => {
    // Format date inputs to standard ISO strings
    const startIso = data.scheduledStart ? new Date(data.scheduledStart).toISOString() : ''
    const endIso = data.scheduledEnd ? new Date(data.scheduledEnd).toISOString() : ''

    createChangeMutation.mutate({
      title: data.title,
      description: data.description,
      changeType: data.changeType,
      riskLevel: data.riskLevel,
      implementationPlan: data.implementationPlan,
      rollbackPlan: data.rollbackPlan,
      testPlan: data.testPlan,
      scheduledStart: startIso,
      scheduledEnd: endIso,
    })
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/changes" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          Changes
        </MuiLink>
        <Typography color="text.primary">New Change</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/changes')}
          sx={{ color: '#94a3b8', mb: 2 }}
        >
          Back to List
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SwapHoriz color="primary" sx={{ fontSize: '1.8rem' }} />
          <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 800 }}>
            Create Change Request (RFC)
          </Typography>
        </Box>
      </Box>

      {/* Form Grid */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Left Column Planning Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ background: '#111827' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 3 }}>
                  Change Details
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    required
                    fullWidth
                    label="Change Title"
                    placeholder="Brief description of the change target..."
                    {...register('title')}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />

                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Description & Reason"
                    placeholder="Provide full details, benefits, business need, and technical explanation..."
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />

                  <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.08)' }} />

                  <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                    Planning Checklists
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Implementation Steps"
                    placeholder="Step-by-step technical checklist to deploy this change..."
                    {...register('implementationPlan')}
                    error={!!errors.implementationPlan}
                    helperText={errors.implementationPlan?.message}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Rollback Plan"
                    placeholder="Detailed actions to take if verification tests fail and rollbacks are needed..."
                    {...register('rollbackPlan')}
                    error={!!errors.rollbackPlan}
                    helperText={errors.rollbackPlan?.message}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Test Plan"
                    placeholder="Verification steps to confirm implementation was fully successful..."
                    {...register('testPlan')}
                    error={!!errors.testPlan}
                    helperText={errors.testPlan?.message}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column Classification Timeline */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ background: '#111827', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 3 }}>
                  Classification
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Change Type Select */}
                  <FormControl fullWidth size="small" error={!!errors.changeType}>
                    <InputLabel id="change-type-label" shrink>Change Type</InputLabel>
                    <Controller
                      name="changeType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId="change-type-label"
                          label="Change Type"
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Select Change Type
                          </MenuItem>
                          <MenuItem value="STANDARD">Standard — Low risk, pre-approved</MenuItem>
                          <MenuItem value="NORMAL">Normal — Requires CAB review</MenuItem>
                          <MenuItem value="EMERGENCY">Emergency — Critical priority fix</MenuItem>
                        </Select>
                      )}
                    />
                    <FormHelperText>{errors.changeType?.message}</FormHelperText>
                  </FormControl>

                  {/* Risk Level Select */}
                  <FormControl fullWidth size="small" error={!!errors.riskLevel}>
                    <InputLabel id="risk-level-label" shrink>Risk Level</InputLabel>
                    <Controller
                      name="riskLevel"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId="risk-level-label"
                          label="Risk Level"
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Select Risk Level
                          </MenuItem>
                          <MenuItem value="LOW">Low Risk</MenuItem>
                          <MenuItem value="MEDIUM">Medium Risk</MenuItem>
                          <MenuItem value="HIGH">High Risk</MenuItem>
                          <MenuItem value="CRITICAL">Critical Risk</MenuItem>
                        </Select>
                      )}
                    />
                    <FormHelperText>{errors.riskLevel?.message}</FormHelperText>
                  </FormControl>

                  <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.08)' }} />

                  <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                    Implementation Window
                  </Typography>

                  {/* Scheduled Start */}
                  <TextField
                    type="datetime-local"
                    label="Scheduled Start Date"
                    {...register('scheduledStart')}
                    error={!!errors.scheduledStart}
                    helperText={errors.scheduledStart?.message}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.85rem',
                      },
                    }}
                  />

                  {/* Scheduled End */}
                  <TextField
                    type="datetime-local"
                    label="Scheduled End Date"
                    {...register('scheduledEnd')}
                    error={!!errors.scheduledEnd}
                    helperText={errors.scheduledEnd?.message}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Alert Info */}
            <Alert
              severity="info"
              sx={{
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                color: '#94a3b8',
                '& .MuiAlert-icon': {
                  color: '#3b82f6',
                },
              }}
            >
              Saved as DRAFT. Submit the RFC when implementation plans and testing strategies are complete.
            </Alert>

            {/* Submit Action */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={createChangeMutation.isPending}
              sx={{
                mt: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.25)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                },
              }}
            >
              {createChangeMutation.isPending ? 'Drafting...' : 'Create Draft RFC'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}
