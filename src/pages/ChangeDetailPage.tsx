import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Tabs,
  Tab,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Skeleton,
} from '@mui/material'
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  AccessTime,
  SwapHoriz,
} from '@mui/icons-material'
import {
  useChange,
  useSubmitChange,
  useRecordApproval,
} from '@/hooks/useItsm'
import { useAuthStore, selectIsManagerOrAdmin } from '@/store/authStore'
import {
  ChangeStatusChip,
  RiskBadge,
  InfoRow,
  ErrorState,
} from '@/components/common/ItsmComponents'
import { formatDateTime } from '@/utils'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`change-tabpanel-${index}`}
      aria-labelledby={`change-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `change-tab-${index}`,
    'aria-controls': `change-tabpanel-${index}`,
  }
}

export default function ChangeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const changeId = parseInt(id ?? '', 10)

  const { user } = useAuthStore()
  const isManagerOrAdminUser = useAuthStore(selectIsManagerOrAdmin)

  const { data: change, isLoading, error, refetch } = useChange(changeId)
  const submitChangeMutation = useSubmitChange(changeId)
  const recordApprovalMutation = useRecordApproval(changeId)

  // Tabs state
  const [tabValue, setTabValue] = useState(0)

  // CAB decision states
  const [decision, setDecision] = useState<string>('')
  const [comments, setComments] = useState<string>('')

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width="15%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={160} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  if (error || !change) {
    return (
      <ErrorState
        message={error?.message || 'Failed to fetch change request.'}
        onRetry={refetch}
      />
    )
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleSubmitForReview = () => {
    submitChangeMutation.mutate()
  }

  const handleRecordDecision = () => {
    if (!decision) return
    recordApprovalMutation.mutate(
      {
        decision,
        comments: comments.trim() || undefined,
      },
      {
        onSuccess: () => {
          setDecision('')
          setComments('')
        },
      }
    )
  }

  // Check if current user requires CAB decision
  const pendingApproval = change.approvals.find(
    (a) => a.approver.username === user?.username && a.decision === 'PENDING'
  )
  const showCabApprovalPanel =
    isManagerOrAdminUser && change.status === 'CAB_REVIEW' && !!pendingApproval

  return (
    <Box>
      {/* Detail Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/changes')}
          sx={{ color: '#94a3b8', mb: 2 }}
        >
          Back to List
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={change.ticketNumber}
                sx={{
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  color: '#3b82f6',
                  borderRadius: 1,
                }}
              />
              <Chip
                label={change.changeType}
                size="small"
                sx={{
                  backgroundColor: 'rgba(6, 182, 212, 0.12)',
                  color: '#06b6d4',
                  fontWeight: 600,
                  borderRadius: 1,
                }}
              />
              <ChangeStatusChip status={change.status} />
              <RiskBadge riskLevel={change.riskLevel} />
            </Box>

            <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 800, mb: 1 }}>
              {change.title}
            </Typography>

            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Requested by {change.createdBy.fullName} · Created {formatDateTime(change.createdAt)}
            </Typography>
          </Box>

          {/* DRAFT submission action */}
          {change.status === 'DRAFT' && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitForReview}
              disabled={submitChangeMutation.isPending}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              }}
            >
              {submitChangeMutation.isPending ? <CircularProgress size={20} /> : 'Submit for Review'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Grid detail */}
      <Grid container spacing={3}>
        {/* Left column info tabs */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ background: '#111827' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'rgba(148, 163, 184, 0.08)' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="change details tabs">
                <Tab label="Overview" {...a11yProps(0)} />
                <Tab label="Implementation Plan" {...a11yProps(1)} />
                <Tab label="Approvals" {...a11yProps(2)} />
              </Tabs>
            </Box>

            <CardContent sx={{ px: 3, pb: 3 }}>
              {/* Tab 0: Overview */}
              <CustomTabPanel value={tabValue} index={0}>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 1.5 }}>
                  Description & Context
                </Typography>
                <Typography variant="body1" sx={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', mb: 4 }}>
                  {change.description}
                </Typography>

                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 2 }}>
                  Implementation Timeline Windows
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow label="Scheduled Start" value={formatDateTime(change.scheduledStart)} />
                    <InfoRow label="Scheduled End" value={formatDateTime(change.scheduledEnd)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoRow label="Actual Start" value={formatDateTime(change.actualStart)} />
                    <InfoRow label="Actual End" value={formatDateTime(change.actualEnd)} />
                  </Grid>
                </Grid>
              </CustomTabPanel>

              {/* Tab 1: Technical plans */}
              <CustomTabPanel value={tabValue} index={1}>
                {/* Implementation steps */}
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 1.5 }}>
                  Implementation Step Checklist
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#0a0f1e',
                    border: '1px solid rgba(148, 163, 184, 0.08)',
                    borderRadius: 1.5,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: change.implementationPlan ? '#e2e8f0' : '#64748b',
                      whiteSpace: 'pre-wrap',
                      fontStyle: change.implementationPlan ? 'normal' : 'italic',
                    }}
                  >
                    {change.implementationPlan || 'Not specified'}
                  </Typography>
                </Box>

                {/* Rollback steps */}
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 1.5 }}>
                  Rollback & Mitigation Plan
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#0a0f1e',
                    border: '1px solid rgba(148, 163, 184, 0.08)',
                    borderRadius: 1.5,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: change.rollbackPlan ? '#e2e8f0' : '#64748b',
                      whiteSpace: 'pre-wrap',
                      fontStyle: change.rollbackPlan ? 'normal' : 'italic',
                    }}
                  >
                    {change.rollbackPlan || 'Not specified'}
                  </Typography>
                </Box>

                {/* Test Plan */}
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 1.5 }}>
                  Validation & Test Plan
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#0a0f1e',
                    border: '1px solid rgba(148, 163, 184, 0.08)',
                    borderRadius: 1.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: change.testPlan ? '#e2e8f0' : '#64748b',
                      whiteSpace: 'pre-wrap',
                      fontStyle: change.testPlan ? 'normal' : 'italic',
                    }}
                  >
                    {change.testPlan || 'Not specified'}
                  </Typography>
                </Box>
              </CustomTabPanel>

              {/* Tab 2: Approvals history */}
              <CustomTabPanel value={tabValue} index={2}>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 3 }}>
                  CAB Approval Log
                </Typography>

                {change.approvals.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                    No approvals required or configured for this change plan.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {change.approvals.map((approval) => {
                      const isPending = approval.decision === 'PENDING'
                      const isApproved = approval.decision === 'APPROVED'
                      
                      let chipIcon = <AccessTime />
                      let chipColor: 'default' | 'success' | 'error' = 'default'
                      
                      if (isApproved) {
                        chipIcon = <CheckCircle />
                        chipColor = 'success'
                      } else if (approval.decision === 'REJECTED') {
                        chipIcon = <Cancel />
                        chipColor = 'error'
                      }

                      return (
                        <Card
                          key={approval.id}
                          sx={{
                            background: '#0a0f1e',
                            border: '1px solid rgba(148, 163, 184, 0.06)',
                            p: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: 1.5,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ bgcolor: 'primary.dark', width: 32, height: 32, fontSize: '0.8rem' }}>
                                {approval.approver.fullName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                                  {approval.approver.fullName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                  {approval.approver.email}
                                </Typography>
                              </Box>
                            </Box>

                            <Chip
                              icon={chipIcon}
                              label={approval.decision}
                              color={chipColor}
                              size="small"
                              sx={{ fontWeight: 600, borderRadius: 1 }}
                            />
                          </Box>

                          {approval.comments && (
                            <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ color: '#cbd5e1', fontStyle: 'italic' }}>
                                "{approval.comments}"
                              </Typography>
                            </Box>
                          )}

                          {!isPending && approval.decidedAt && (
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1.5, textAlign: 'right' }}>
                              Reviewed: {formatDateTime(approval.decidedAt)}
                            </Typography>
                          )}
                        </Card>
                      )
                    })}
                  </Box>
                )}
              </CustomTabPanel>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column details */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Metadata details card */}
          <Card sx={{ background: '#111827', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 2 }}>
                Classification
              </Typography>

              <InfoRow label="Ticket Number" value={change.ticketNumber} />
              <InfoRow label="Change Type" value={change.changeType} />
              <InfoRow label="Risk Assessment" value={change.riskLevel} />
              <InfoRow label="Requested By" value={change.createdBy.fullName} />
              <InfoRow
                label="Assignee"
                value={change.assignedTo?.fullName ?? 'Unassigned'}
              />
              <InfoRow
                label="Group"
                value={change.assignmentGroup?.name ?? 'Unassigned'}
              />
              <InfoRow label="Created Date" value={formatDateTime(change.createdAt)} />
            </CardContent>
          </Card>

          {/* CAB Approval Form Panel */}
          {showCabApprovalPanel && (
            <Card
              sx={{
                background: '#111827',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.05)',
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'primary.light', fontWeight: 700, mb: 2 }}>
                  Your Approval Required
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="decision-select-label">Your Decision</InputLabel>
                    <Select
                      labelId="decision-select-label"
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      label="Your Decision"
                    >
                      <MenuItem value="APPROVED">APPROVED</MenuItem>
                      <MenuItem value="REJECTED">REJECTED</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Comments"
                    multiline
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide context for approval or reasons for rejection..."
                    size="small"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />

                  <Button
                    variant="contained"
                    color={decision === 'REJECTED' ? 'error' : 'primary'}
                    onClick={handleRecordDecision}
                    disabled={!decision || recordApprovalMutation.isPending}
                    fullWidth
                  >
                    {recordApprovalMutation.isPending ? (
                      <CircularProgress size={24} sx={{ color: '#fff' }} />
                    ) : (
                      'Record Decision'
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
