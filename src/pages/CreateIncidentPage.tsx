import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
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
import { BugReport, ArrowBack } from '@mui/icons-material'
import { useCreateIncident, useGroups } from '@/hooks/useItsm'
import { calculatePriorityPreview } from '@/utils'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/types/index'

const CATEGORIES: Record<string, string[]> = {
  'Infrastructure': ['Server', 'Network', 'Storage', 'Database', 'Cloud'],
  'Application': ['Web Application', 'Desktop App', 'Mobile App', 'API', 'HR System'],
  'Security': ['Authentication', 'Authorization', 'Malware', 'Phishing'],
  'Hardware': ['Laptop', 'Desktop', 'Printer', 'AV Equipment', 'Monitor'],
  'Network': ['VPN', 'WiFi', 'Firewall', 'Switch', 'Internet'],
  'Communication': ['Email', 'Phone', 'Video Conferencing'],
  'Access Management': ['Account Creation', 'Password Reset', 'File Permissions'],
  'Software': ['License', 'Installation', 'Update', 'Configuration'],
}

const incidentSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters'),
  category: yup.string().required('Category is required'),
  subcategory: yup.string().required('Subcategory is required'),
  impact: yup.string().required('Impact level is required'),
  urgency: yup.string().required('Urgency level is required'),
  assignmentGroupId: yup
    .mixed<number>()
    .nullable()
    .transform((val, originalVal) => (originalVal === '' ? null : Number(val))),
})

type IncidentFormInputs = yup.InferType<typeof incidentSchema>

export default function CreateIncidentPage() {
  const navigate = useNavigate()
  const { data: groups } = useGroups()
  const createIncidentMutation = useCreateIncident()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IncidentFormInputs>({
    resolver: yupResolver(incidentSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      subcategory: '',
      impact: '',
      urgency: '',
      assignmentGroupId: null,
    },
  })

  // Watch fields
  const categorySelected = watch('category')
  const impactSelected = watch('impact')
  const urgencySelected = watch('urgency')

  // Reset subcategory when category changes
  useEffect(() => {
    setValue('subcategory', '')
  }, [categorySelected, setValue])

  const subcategories = categorySelected ? CATEGORIES[categorySelected] : []

  // Calculate Priority preview
  const previewPriority =
    impactSelected && urgencySelected
      ? calculatePriorityPreview(impactSelected, urgencySelected)
      : null

  const onSubmit = (data: IncidentFormInputs) => {
    createIncidentMutation.mutate(
      {
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        impact: data.impact,
        urgency: data.urgency,
        assignmentGroupId: data.assignmentGroupId,
      },
      {
        onSuccess: (newIncident) => {
          navigate(`/incidents/${newIncident.id}`)
        },
      }
    )
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/incidents" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          Incidents
        </MuiLink>
        <Typography color="text.primary">New Incident</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/incidents')}
          sx={{ color: '#94a3b8', mb: 2 }}
        >
          Back to List
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BugReport color="primary" sx={{ fontSize: '1.8rem' }} />
          <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 800 }}>
            Create New Incident Ticket
          </Typography>
        </Box>
      </Box>

      {/* Form Container Grid */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Left Column Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ background: '#111827' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 3 }}>
                  Incident Details
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    required
                    fullWidth
                    label="Incident Title"
                    placeholder="Short, descriptive summary (e.g. VPN access failing for finance department)"
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
                    rows={5}
                    label="Detailed Description"
                    placeholder="Provide full description, steps to reproduce, errors seen, and any impact details..."
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />

                  <Grid container spacing={3}>
                    {/* Category Select */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth size="small" error={!!errors.category}>
                        <InputLabel id="category-select-label" shrink>Category</InputLabel>
                        <Controller
                          name="category"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              labelId="category-select-label"
                              label="Category"
                              displayEmpty
                            >
                              <MenuItem value="" disabled>
                                Select Category
                              </MenuItem>
                              {Object.keys(CATEGORIES).map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                  {cat}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        <FormHelperText>{errors.category?.message}</FormHelperText>
                      </FormControl>
                    </Grid>

                    {/* Subcategory Select */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl
                        fullWidth
                        size="small"
                        error={!!errors.subcategory}
                        disabled={!categorySelected}
                      >
                        <InputLabel id="subcategory-select-label" shrink>Subcategory</InputLabel>
                        <Controller
                          name="subcategory"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              labelId="subcategory-select-label"
                              label="Subcategory"
                              displayEmpty
                            >
                              <MenuItem value="" disabled>
                                Select Subcategory
                              </MenuItem>
                              {subcategories.map((sub) => (
                                <MenuItem key={sub} value={sub}>
                                  {sub}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        <FormHelperText>{errors.subcategory?.message}</FormHelperText>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column Classification */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ background: '#111827', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 3 }}>
                  Classification
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Impact Select */}
                  <FormControl fullWidth size="small" error={!!errors.impact}>
                    <InputLabel id="impact-select-label" shrink>Impact</InputLabel>
                    <Controller
                      name="impact"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId="impact-select-label"
                          label="Impact"
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Select Impact
                          </MenuItem>
                          <MenuItem value="HIGH">High — Organization wide</MenuItem>
                          <MenuItem value="MEDIUM">Medium — Multiple users</MenuItem>
                          <MenuItem value="LOW">Low — Individual user</MenuItem>
                        </Select>
                      )}
                    />
                    <FormHelperText>{errors.impact?.message}</FormHelperText>
                  </FormControl>

                  {/* Urgency Select */}
                  <FormControl fullWidth size="small" error={!!errors.urgency}>
                    <InputLabel id="urgency-select-label" shrink>Urgency</InputLabel>
                    <Controller
                      name="urgency"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          labelId="urgency-select-label"
                          label="Urgency"
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Select Urgency
                          </MenuItem>
                          <MenuItem value="HIGH">High — Critical blocker</MenuItem>
                          <MenuItem value="MEDIUM">Medium — Degradation seen</MenuItem>
                          <MenuItem value="LOW">Low — Workaround exists</MenuItem>
                        </Select>
                      )}
                    />
                    <FormHelperText>{errors.urgency?.message}</FormHelperText>
                  </FormControl>

                  {/* Priority Preview Box */}
                  {previewPriority && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        backgroundColor:
                          PRIORITY_COLORS[previewPriority] + '12',
                        border: `1px solid ${PRIORITY_COLORS[previewPriority]}50`,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>
                        Calculated Priority Target
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: PRIORITY_COLORS[previewPriority],
                          fontWeight: 800,
                        }}
                      >
                        {PRIORITY_LABELS[previewPriority]}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.08)' }} />

                  {/* Assignment Group Select */}
                  <FormControl fullWidth size="small" error={!!errors.assignmentGroupId}>
                    <InputLabel id="group-select-label" shrink>Assignment Group</InputLabel>
                    <Controller
                      name="assignmentGroupId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          value={field.value ?? ''}
                          labelId="group-select-label"
                          label="Assignment Group"
                          displayEmpty
                        >
                          <MenuItem value="">Unassigned</MenuItem>
                          {groups?.map((g) => (
                            <MenuItem key={g.id} value={g.id}>
                              {g.name}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    <FormHelperText>{errors.assignmentGroupId?.message}</FormHelperText>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>

            {/* SLA Alert Info */}
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
              SLA timer starts immediately upon submission. P1 tickets have a 1-hour resolution SLA.
            </Alert>

            {/* Submit Action */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={createIncidentMutation.isPending}
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
              {createIncidentMutation.isPending ? 'Submitting...' : 'Submit Incident'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}
