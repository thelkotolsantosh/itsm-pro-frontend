import React from 'react'
import { Chip, Box, CircularProgress, Typography, Button } from '@mui/material'
import { Warning, InboxOutlined, ErrorOutline } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

// Priority Color Map
export const PRIORITY_MAP: Record<string, { bg: string; color: string; label: string }> = {
  P1: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', label: 'P1 Critical' },
  P2: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', label: 'P2 High' },
  P3: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', label: 'P3 Medium' },
  P4: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', label: 'P4 Low' },
}

// Incident Status Color Map
export const INCIDENT_STATUS_MAP: Record<string, { bg: string; color: string }> = {
  NEW: { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' },
  ASSIGNED: { bg: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa' },
  IN_PROGRESS: { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' },
  PENDING: { bg: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa' },
  RESOLVED: { bg: 'rgba(52, 211, 153, 0.12)', color: '#34d399' },
  CLOSED: { bg: 'rgba(107, 114, 128, 0.12)', color: '#9ca3af' },
  CANCELLED: { bg: 'rgba(107, 114, 128, 0.08)', color: '#6b7280' },
}

// Change Status Color Map
export const CHANGE_STATUS_MAP: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' },
  SUBMITTED: { bg: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa' },
  CAB_REVIEW: { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' },
  APPROVED: { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399' },
  SCHEDULED: { bg: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' },
  IMPLEMENTED: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' },
  FAILED: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' },
  CLOSED: { bg: 'rgba(107, 114, 128, 0.12)', color: '#9ca3af' },
  REJECTED: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' },
}

// Risk Color Map
export const RISK_COLORS: Record<string, string> = {
  LOW: '#34d399',
  MEDIUM: '#fbbf24',
  HIGH: '#f87171',
  CRITICAL: '#ef4444',
}

const PulsingChip = styled(Chip)(({ theme }) => ({
  animation: 'sla-pulse 2s infinite ease-in-out',
  '@keyframes sla-pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)',
    },
    '70%': {
      boxShadow: '0 0 0 6px rgba(239, 68, 68, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)',
    },
  },
}))

export function PriorityChip({ priority }: { priority: string }) {
  const config = PRIORITY_MAP[priority] || {
    bg: 'rgba(148,163,184,0.12)',
    color: '#94a3b8',
    label: priority,
  }
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        borderRadius: 1,
      }}
    />
  )
}

export function IncidentStatusChip({ status }: { status: string }) {
  const config = INCIDENT_STATUS_MAP[status] || {
    bg: 'rgba(148,163,184,0.12)',
    color: '#94a3b8',
  }
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        borderRadius: 1,
      }}
    />
  )
}

export function ChangeStatusChip({ status }: { status: string }) {
  const config = CHANGE_STATUS_MAP[status] || {
    bg: 'rgba(148,163,184,0.12)',
    color: '#94a3b8',
  }
  return (
    <Chip
      label={status.replace('_', ' ')}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        borderRadius: 1,
      }}
    />
  )
}

export function SlaStatusChip({ slaStatus }: { slaStatus: string }) {
  if (slaStatus === 'BREACHED') {
    return (
      <PulsingChip
        icon={<Warning style={{ color: '#ef4444', fontSize: '0.95rem' }} />}
        label="BREACHED"
        size="small"
        sx={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          fontWeight: 700,
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 1,
        }}
      />
    )
  }

  if (slaStatus === 'AT_RISK') {
    return (
      <Chip
        label="AT RISK"
        size="small"
        sx={{
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          fontWeight: 600,
          borderRadius: 1,
        }}
      />
    )
  }

  return (
    <Chip
      label="ON TRACK"
      size="small"
      sx={{
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: '#34d399',
        fontWeight: 600,
        borderRadius: 1,
      }}
    />
  )
}

export function RiskBadge({ riskLevel }: { riskLevel: string }) {
  const color = RISK_COLORS[riskLevel] || '#94a3b8'
  return (
    <Typography
      variant="body2"
      sx={{
        color,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      ● {riskLevel}
    </Typography>
  )
}

export function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        width: '100%',
      }}
    >
      <CircularProgress size={36} color="primary" />
    </Box>
  )
}

export function EmptyState({
  title = 'No Data Available',
  subtitle = 'There are no items matching this view.',
  icon = <InboxOutlined style={{ fontSize: '3rem', color: '#64748b' }} />,
}: {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        textAlign: 'center',
        backgroundColor: '#111827',
        border: '1px dashed rgba(148, 163, 184, 0.15)',
        borderRadius: 2,
        my: 2,
      }}
    >
      {icon}
      <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#f1f5f9', fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: '400px' }}>
        {subtitle}
      </Typography>
    </Box>
  )
}

export function ErrorState({
  message = 'An error occurred while loading data.',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        textAlign: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        borderRadius: 2,
        my: 2,
      }}
    >
      <ErrorOutline style={{ fontSize: '3rem', color: '#ef4444' }} />
      <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#f87171', fontWeight: 600 }}>
        Loading Failed
      </Typography>
      <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, maxWidth: '450px' }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="error" onClick={onRetry}>
          Retry Connection
        </Button>
      )}
    </Box>
  )
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  )
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
        borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ color: '#f1f5f9', fontWeight: 600, textAlign: 'right' }}>
        {value}
      </Box>
    </Box>
  )
}
