import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Slider,
  LinearProgress,
} from '@mui/material'
import {
  ArrowBack,
  PlayArrow,
  Pause,
  AssignmentInd,
  Print,
  Timeline,
  AutoAwesome,
  CheckCircle,
  HelpOutline,
} from '@mui/icons-material'
import {
  useIncident,
  useUpdateIncidentStatus,
  useAssignIncident,
  useGroups,
} from '@/hooks/useItsm'
import {
  PriorityChip,
  IncidentStatusChip,
  SlaStatusChip,
  InfoRow,
  ErrorState,
} from '@/components/common/ItsmComponents'
import { userApi, aiApi } from '@/api/services'
import { formatDateTime, formatSlaCountdown, getSlaColor } from '@/utils'
import { IncidentStatus, SlaStatus } from '@/types/index'
import { parseISO, differenceInSeconds } from 'date-fns'
import IncidentLifecycle from '@/components/common/IncidentLifecycle'
import IncidentWarRoom from '@/components/common/IncidentWarRoom'

// SLA Timer component
function SlaCountdownTimer({ incident }: { incident: any }) {
  const isActive = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING'].includes(incident.status)
  const isPaused = incident.slaPaused
  const targetDate = parseISO(incident.slaDueAt)

  const getRemainingSeconds = () => {
    return Math.max(0, differenceInSeconds(targetDate, new Date()))
  }

  const [secondsLeft, setSecondsLeft] = useState(getRemainingSeconds())

  useEffect(() => {
    if (!isActive || isPaused) return

    const interval = setInterval(() => {
      setSecondsLeft(getRemainingSeconds())
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, isPaused, incident.slaDueAt])

  if (!isActive) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 600 }}>
          SLA Completed
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Ticket is resolved/closed
        </Typography>
      </Box>
    )
  }

  if (isPaused) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Chip
          icon={<Pause style={{ color: '#a78bfa' }} />}
          label="⏸ SLA PAUSED"
          sx={{
            backgroundColor: 'rgba(167, 139, 250, 0.15)',
            color: '#a78bfa',
            fontWeight: 700,
            mb: 1,
            borderRadius: 1,
          }}
        />
        <Typography variant="h4" sx={{ color: '#a78bfa', fontWeight: 800, fontFamily: 'monospace' }}>
          {formatSlaCountdown(incident.slaMinutesRemaining * 60)}
        </Typography>
      </Box>
    )
  }

  const isBreached = secondsLeft <= 0 || incident.slaStatus === 'BREACHED'
  const slaStatus: SlaStatus = isBreached ? 'BREACHED' : secondsLeft <= 3600 ? 'AT_RISK' : 'ON_TRACK'
  const color = getSlaColor(slaStatus)

  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Time Remaining
      </Typography>
      <Typography variant="h4" sx={{ color, fontWeight: 800, fontFamily: 'monospace', my: 1 }}>
        {formatSlaCountdown(secondsLeft)}
      </Typography>
      <SlaStatusChip slaStatus={slaStatus} />
    </Box>
  )
}

// Assignment Dialog helper
function AssignDialog({
  open,
  onClose,
  incidentId,
  currentGroupId,
  currentAssigneeId,
}: {
  open: boolean
  onClose: () => void
  incidentId: number
  currentGroupId?: number
  currentAssigneeId?: number
}) {
  const { data: groupsData } = useGroups()
  const { data: usersData } = useQuery({
    queryKey: ['users-list-assign'],
    queryFn: () => userApi.getAll({ size: 100 }).then((res) => res.data),
  })

  const assignMutation = useAssignIncident(incidentId)

  const [groupId, setGroupId] = useState<number | ''>(currentGroupId ?? '')
  const [assigneeId, setAssigneeId] = useState<number | ''>(currentAssigneeId ?? '')

  const handleSave = () => {
    assignMutation.mutate(
      {
        groupId: groupId === '' ? null : groupId,
        assigneeId: assigneeId === '' ? null : assigneeId,
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ color: '#f1f5f9', fontWeight: 700 }}>Assign Incident</DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Assignment Group */}
          <FormControl fullWidth size="small">
            <InputLabel id="assign-group-select-label">Assignment Group</InputLabel>
            <Select
              labelId="assign-group-select-label"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value as number | '')}
              label="Assignment Group"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {groupsData?.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Assignee */}
          <FormControl fullWidth size="small">
            <InputLabel id="assignee-select-label">Assignee</InputLabel>
            <Select
              labelId="assignee-select-label"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value as number | '')}
              label="Assignee"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {usersData?.content.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.fullName} ({u.username})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={assignMutation.isPending}
        >
          {assignMutation.isPending ? <CircularProgress size={20} /> : 'Save Assignment'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Status Action Panel
const STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'PENDING', 'CANCELLED'],
  IN_PROGRESS: ['PENDING', 'RESOLVED', 'CANCELLED'],
  PENDING: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  CANCELLED: [],
}

function StatusActionPanel({ incident }: { incident: any }) {
  const allowed = STATUS_TRANSITIONS[incident.status as IncidentStatus] ?? []
  if (allowed.length === 0) return null

  const updateStatusMutation = useUpdateIncidentStatus(incident.id)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [resolutionNotes, setResolutionNotes] = useState<string>('')

  const handleUpdate = () => {
    if (!selectedStatus) return
    updateStatusMutation.mutate(
      {
        newStatus: selectedStatus,
        resolutionNotes: selectedStatus === 'RESOLVED' ? resolutionNotes : undefined,
      },
      {
        onSuccess: () => {
          setSelectedStatus('')
          setResolutionNotes('')
        },
      }
    )
  }

  return (
    <Card sx={{ background: '#111827', mb: 3 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 2 }}>
          Transition Ticket Status
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="transition-select-label">Select Next Status</InputLabel>
            <Select
              labelId="transition-select-label"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Select Next Status"
            >
              {allowed.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedStatus === 'RESOLVED' && (
            <TextField
              label="Resolution Notes"
              required
              multiline
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe the final solution or root-cause summary..."
              size="small"
              error={selectedStatus === 'RESOLVED' && !resolutionNotes.trim()}
              helperText={
                selectedStatus === 'RESOLVED' && !resolutionNotes.trim()
                  ? 'Resolution notes are required'
                  : ''
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            disabled={
              !selectedStatus ||
              (selectedStatus === 'RESOLVED' && !resolutionNotes.trim()) ||
              updateStatusMutation.isPending
            }
            sx={{ mt: 1 }}
          >
            {updateStatusMutation.isPending ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              `Set Status: ${selectedStatus || '...'}`
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

// Generate dynamic incident timeline events
const getTimelineEvents = (inc: any) => {
  const groupName = inc.assignmentGroup ? inc.assignmentGroup.name : 'Technical Operations'
  const ownerName = inc.assignedTo ? inc.assignedTo.fullName : 'System Specialist'
  const category = inc.category || 'Software'
  
  return [
    {
      stage: 'Ticket Created',
      time: '14:00:12',
      status: 'NEW' as IncidentStatus,
      team: 'Unassigned',
      owner: 'Unassigned',
      log: `Incident ticket registered in the portal. Priority evaluated to ${inc.priority} based on urgency & impact.`,
    },
    {
      stage: 'Auto-Routed',
      time: '14:02:45',
      status: 'NEW' as IncidentStatus,
      team: groupName,
      owner: 'Unassigned',
      log: `Auto-routing system matched category '${category}' and queued ticket for the assignment group: ${groupName}.`,
    },
    {
      stage: 'Assigned',
      time: '14:15:30',
      status: 'ASSIGNED' as IncidentStatus,
      team: groupName,
      owner: ownerName,
      log: `Ticket claimed by engineer ${ownerName} from ${groupName} queue. SLA clock is active.`,
    },
    {
      stage: 'Investigating',
      time: '14:28:10',
      status: 'IN_PROGRESS' as IncidentStatus,
      team: groupName,
      owner: ownerName,
      log: `Telemetry monitoring alerts analysed. Log spikes identified. Initiating active remote diagnostics.`,
    },
    {
      stage: 'Resolved',
      time: '14:48:55',
      status: (inc.status === 'RESOLVED' || inc.status === 'CLOSED') ? inc.status : ('IN_PROGRESS' as IncidentStatus),
      team: groupName,
      owner: ownerName,
      log: inc.resolutionNotes || `Service health validation completed. Hotfix applied. Service availability verified.`,
    },
  ]
}

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const incidentId = parseInt(id ?? '', 10)

  const { data: incident, isLoading, error, refetch } = useIncident(incidentId)
  const [assignOpen, setAssignOpen] = useState(false)
  const [rcaReportOpen, setRcaReportOpen] = useState(false)

  // Timeline Slider state
  const [timelineStep, setTimelineStep] = useState(4)

  // AI Root Cause Query
  const { data: rcaData, isLoading: isRcaLoading } = useQuery({
    queryKey: ['incident-rca', incidentId],
    queryFn: () => aiApi.generateRca(incidentId).then((res) => res.data),
    enabled: !!incidentId,
  })

  // Synchronize timeline step with incident status changes
  useEffect(() => {
    if (incident) {
      if (incident.status === 'NEW') setTimelineStep(1)
      else if (incident.status === 'ASSIGNED') setTimelineStep(2)
      else if (incident.status === 'IN_PROGRESS' || incident.status === 'PENDING') setTimelineStep(3)
      else if (incident.status === 'RESOLVED' || incident.status === 'CLOSED') setTimelineStep(4)
    }
  }, [incident])

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width="15%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={160} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  if (error || !incident) {
    return (
      <ErrorState
        message={error?.message || 'Failed to fetch incident log.'}
        onRetry={refetch}
      />
    )
  }

  const isSlaBreached = incident.slaStatus === 'BREACHED'
  const isP1orP2 = incident.priority === 'P1' || incident.priority === 'P2'

  // Generate timeline info
  const timelineEvents = getTimelineEvents(incident)
  const activeEvent = timelineEvents[timelineStep] || timelineEvents[4]

  const handlePrintRca = () => {
    window.print()
  }

  return (
    <Box>
      {/* Dynamic style for print mode */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #rca-report-print-area, #rca-report-print-area * {
              visibility: visible;
            }
            #rca-report-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: #ffffff !important;
              color: #000000 !important;
              padding: 40px !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Detail Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/incidents')}
            sx={{ color: '#94a3b8', mb: 2 }}
          >
            Back to List
          </Button>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={incident.ticketNumber}
              sx={{
                fontWeight: 800,
                fontFamily: 'monospace',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#3b82f6',
                borderRadius: 1,
              }}
            />
            <PriorityChip priority={incident.priority} />
            {/* Show status corresponding to timeline replay step */}
            <IncidentStatusChip status={activeEvent.status} />
            {isSlaBreached && (
              <Chip
                label="SLA BREACHED"
                color="error"
                size="small"
                sx={{ fontWeight: 700, borderRadius: 1 }}
              />
            )}
          </Box>

          <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 800, mb: 1 }}>
            {incident.title}
          </Typography>

          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Reported by {incident.createdBy.fullName} · {formatDateTime(incident.createdAt)}
          </Typography>
        </Box>

        <Box sx={{ mt: { xs: 0, md: 5 } }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Print />}
            onClick={() => setRcaReportOpen(true)}
            sx={{
              borderColor: 'rgba(59, 130, 246, 0.5)',
              color: '#3b82f6',
              fontWeight: 700,
              textTransform: 'none',
              background: 'rgba(59, 130, 246, 0.05)',
              '&:hover': {
                background: 'rgba(59, 130, 246, 0.12)',
                borderColor: '#3b82f6',
              },
            }}
          >
            Generate RCA Report
          </Button>
        </Box>
      </Box>

      {/* Incident Stage Lifecycle Chevron Banner */}
      <Box sx={{ mb: 4 }}>
        {/* Render lifecycle with current timeline event status */}
        <IncidentLifecycle currentStatus={activeEvent.status} />
      </Box>

      {/* Main Grid Detail */}
      <Grid container spacing={3}>
        {/* Left column details */}
        <Grid size={{ xs: 12, md: 8 }}>
          
          {/* Timeline Replay Scrubbing Slider */}
          <Card sx={{ background: '#111827', mb: 3, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Timeline sx={{ color: '#3b82f6' }} />
                <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 800 }}>
                  Incident Timeline Replay Slider
                </Typography>
              </Box>

              <Box sx={{ px: 3, py: 1, mb: 2 }}>
                <Slider
                  value={timelineStep}
                  min={0}
                  max={4}
                  step={1}
                  onChange={(e, val) => setTimelineStep(val as number)}
                  marks={timelineEvents.map((ev, index) => ({
                    value: index,
                    label: ev.stage,
                  }))}
                  sx={{
                    color: '#3b82f6',
                    '& .MuiSlider-markLabel': {
                      color: '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    },
                    '& .MuiSlider-markLabelActive': {
                      color: '#3b82f6',
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: 2,
                  p: 2,
                  mt: 2,
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                      TIMELINE CLOCK
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 700, fontFamily: 'monospace' }}>
                      {activeEvent.time}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                      QUEUE TEAM
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                      {activeEvent.team}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                      ASSIGNED OWNER
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                      {activeEvent.owner}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                      REPLAY STATUS
                    </Typography>
                    <Chip
                      label={activeEvent.status}
                      size="small"
                      sx={{
                        fontSize: '10px',
                        fontWeight: 800,
                        height: 20,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        borderRadius: 1,
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 1.5 }} />

                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 700, mb: 0.5 }}>
                  STEP DIAGNOSTIC FEEDBACK
                </Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontStyle: 'italic', lineHeight: '140%' }}>
                  {activeEvent.log}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card sx={{ background: '#111827', mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 1.5 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                {incident.description}
              </Typography>
            </CardContent>
          </Card>

          {/* AI Root Cause Engine widget */}
          {rcaData && (
            <Card
              className="glass-card"
              sx={{
                background: 'rgba(17, 24, 39, 0.65)',
                border: '1px solid rgba(167, 139, 250, 0.25)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 15px rgba(167, 139, 250, 0.1)',
                mb: 3,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesome sx={{ color: '#a78bfa', fontSize: '20px' }} />
                    <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 800 }}>
                      AI Root Cause Analysis Engine
                    </Typography>
                  </Box>
                  <Chip
                    label={`Confidence: ${rcaData.confidence}%`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(167, 139, 250, 0.15)',
                      color: '#c084fc',
                      fontWeight: 800,
                      borderRadius: 1,
                      border: '1px solid rgba(167, 139, 250, 0.2)',
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    PROBABLE ROOT CAUSE
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#f8fafc', fontWeight: 700, letterSpacing: '0.2px' }}>
                    🚨 {rcaData.rootCause}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={rcaData.confidence}
                      sx={{
                        flex: 1,
                        height: 5,
                        borderRadius: 5,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#a78bfa',
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {/* Evidence list */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 1 }}>
                      DIAGNOSTIC EVIDENCE
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {rcaData.evidence.map((ev, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <span style={{ color: '#f87171', marginTop: '2px' }}>•</span>
                          <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '130%' }}>
                            {ev}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>

                  {/* Fixes checklist */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 1 }}>
                      RECOMMENDED MITIGATION
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {rcaData.fixes.map((fx, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <CheckCircle sx={{ color: '#34d399', fontSize: '14px', mt: '3px' }} />
                          <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '130%' }}>
                            {fx}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Resolution Notes Card (only if resolved/closed) */}
          {incident.resolutionNotes && (
            <Card
              sx={{
                background: '#111827',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.05)',
                mb: 3,
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 700, mb: 1.5 }}>
                  Resolution Summary
                </Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                  {incident.resolutionNotes}
                </Typography>
                {incident.resolvedAt && (
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1.5 }}>
                    Resolved at: {formatDateTime(incident.resolvedAt)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* General Metadata Details */}
          <Card sx={{ background: '#111827' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700, mb: 2 }}>
                Classification details
              </Typography>

              <InfoRow label="Ticket Number" value={incident.ticketNumber} />
              <InfoRow
                label="Category & Subcategory"
                value={`${incident.category} / ${incident.subcategory || 'None'}`}
              />
              <InfoRow label="Impact" value={incident.impact} />
              <InfoRow label="Urgency" value={incident.urgency} />
              <InfoRow label="Created By" value={incident.createdBy.fullName} />
              <InfoRow label="Created At" value={formatDateTime(incident.createdAt)} />
              <InfoRow label="Last Updated" value={formatDateTime(incident.updatedAt)} />
              {incident.closedAt && (
                <InfoRow label="Closed At" value={formatDateTime(incident.closedAt)} />
              )}
              <InfoRow label="SLA Due Target" value={formatDateTime(incident.slaDueAt)} />
            </CardContent>
          </Card>
        </Grid>

        {/* Right column sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* SLA Countdown Timer */}
          <Card sx={{ background: '#111827', mb: 3 }}>
            <CardContent>
              <SlaCountdownTimer incident={incident} />
            </CardContent>
          </Card>

          {/* Assignment panel */}
          <Card sx={{ background: '#111827', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                  Assigned Team & Owner
                </Typography>
                <IconButton size="small" onClick={() => setAssignOpen(true)} sx={{ color: '#3b82f6' }}>
                  <AssignmentInd fontSize="small" />
                </IconButton>
              </Box>

              {/* Group assignment */}
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>
                Assignment Group
              </Typography>
              {incident.assignmentGroup ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                    {incident.assignmentGroup.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {incident.assignmentGroup.email}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'warning.main', fontStyle: 'italic', mb: 2 }}>
                  No Group Assigned
                </Typography>
              )}

              <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.08)', my: 1.5 }} />

              {/* Individual Assignee */}
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>
                Assignee Owner
              </Typography>
              {incident.assignedTo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.8rem' }}>
                    {incident.assignedTo.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                      {incident.assignedTo.fullName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                      {incident.assignedTo.email}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'warning.main', fontStyle: 'italic' }}>
                  Unassigned
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Status Transitions Panel */}
          <StatusActionPanel incident={incident} />
        </Grid>
      </Grid>

      {/* Incident War Room Widget for P1/P2 Incidents */}
      {isP1orP2 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 800 }}>
              🚨 Emergency Resolution War Room Bridge
            </Typography>
          </Box>
          <IncidentWarRoom />
        </Box>
      )}

      {/* Assignment Dialog */}
      {assignOpen && (
        <AssignDialog
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          incidentId={incident.id}
          currentGroupId={incident.assignmentGroup?.id}
          currentAssigneeId={incident.assignedTo?.id}
        />
      )}

      {/* Generate RCA Report Modal Dialog */}
      <Dialog
        open={rcaReportOpen}
        onClose={() => setRcaReportOpen(false)}
        fullWidth
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            background: '#0f172a',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            color: '#f1f5f9',
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesome sx={{ color: '#a78bfa' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Root Cause Analysis (RCA) Report Document
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            ITSM Pro AI Engine v2.4
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Box id="rca-report-print-area" sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
            {/* Header section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ color: '#f1f5f9', fontWeight: 900, mb: 0.5, letterSpacing: '-0.5px' }}>
                  ROOT CAUSE ANALYSIS REPORT
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                  TICKET: {incident.ticketNumber} · Priority: {incident.priority}
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                  Generated At: {new Date().toLocaleDateString()}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Classification: Official Incident Record
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Metadata table */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>INCIDENT TITLE</Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, mb: 2 }}>{incident.title}</Typography>

                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>CATEGORY / SUBCATEGORY</Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, mb: 2 }}>{incident.category} / {incident.subcategory || 'None'}</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ASSIGNMENT TEAM</Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, mb: 2 }}>
                  {incident.assignmentGroup ? incident.assignmentGroup.name : 'Unassigned'}
                </Typography>

                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>ENGINEER OWNER</Typography>
                <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, mb: 2 }}>
                  {incident.assignedTo ? incident.assignedTo.fullName : 'Unassigned'}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Description */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#3b82f6', fontWeight: 800, mb: 1 }}>
                1. Executive Summary & Incident Description
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1', lineHeight: '160%', whiteSpace: 'pre-wrap' }}>
                {incident.description}
              </Typography>
            </Box>

            {/* Root Cause Details */}
            {rcaData ? (
              <Box sx={{ p: 2.5, borderRadius: 2, background: 'rgba(167, 139, 250, 0.05)', border: '1px solid rgba(167, 139, 250, 0.15)' }}>
                <Typography variant="subtitle2" sx={{ color: '#a78bfa', fontWeight: 800, mb: 1 }}>
                  2. AI-Engine Root Cause Diagnosis (Confidence: {rcaData.confidence}%)
                </Typography>
                <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 700, mb: 2, fontSize: '1rem' }}>
                  Probable Root Cause: {rcaData.rootCause}
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 1 }}>
                      DIAGNOSTIC EVIDENCE
                    </Typography>
                    {rcaData.evidence.map((ev, i) => (
                      <Typography key={i} variant="body2" sx={{ color: '#cbd5e1', mb: 0.5, pl: 1, borderLeft: '2px solid #ef4444' }}>
                        {ev}
                      </Typography>
                    ))}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 1 }}>
                      RECOMMENDED FIX / ACTIONS
                    </Typography>
                    {rcaData.fixes.map((fx, i) => (
                      <Typography key={i} variant="body2" sx={{ color: '#cbd5e1', mb: 0.5, pl: 1, borderLeft: '2px solid #10b981' }}>
                        ✓ {fx}
                      </Typography>
                    ))}
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <CircularProgress size={24} sx={{ mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#64748b' }}>AI Root Cause details loading...</Typography>
              </Box>
            )}

            {/* Timeline */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#3b82f6', fontWeight: 800, mb: 1.5 }}>
                3. Historical Incident Timeline Analysis
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {timelineEvents.map((ev, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 700, width: 80, fontFamily: 'monospace' }}>
                      {ev.time}
                    </Typography>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
                        {ev.stage} ({ev.status})
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {ev.log} · Assigned: {ev.owner} ({ev.team})
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Signatures */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px dashed rgba(148, 163, 184, 0.15)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
              <Box>
                <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)', width: 200, height: 40 }} />
                <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                  Assigned Operations Specialist
                </Typography>
              </Box>
              <Box>
                <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)', width: 200, height: 40 }} />
                <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                  Enterprise NOC Commander Approval
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid rgba(148, 163, 184, 0.08)', pt: 2 }} className="no-print">
          <Button onClick={() => setRcaReportOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Close
          </Button>
          <Button variant="contained" color="primary" startIcon={<Print />} onClick={handlePrintRca} sx={{ fontWeight: 700 }}>
            Print Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
