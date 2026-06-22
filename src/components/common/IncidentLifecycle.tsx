import React from 'react'
import { Box, Typography, Card } from '@mui/material'
import { ArrowForwardIos, Schedule } from '@mui/icons-material'

interface IncidentLifecycleProps {
  currentStatus: string
}

const STAGES = [
  { key: 'NEW', label: 'New', duration: '12m', details: 'Auto-routed in 12 mins' },
  { key: 'ASSIGNED', label: 'Assigned', duration: '45m', details: 'Technician queue delay' },
  { key: 'IN_PROGRESS', label: 'In Progress', duration: '2.5h', details: 'Under Active Repair' },
  { key: 'RESOLVED', label: 'Resolved', duration: '5d', details: 'Resolved' },
  { key: 'CLOSED', label: 'Closed', duration: '—', details: 'Archive record' },
]

export default function IncidentLifecycle({ currentStatus }: IncidentLifecycleProps) {
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'NEW':
        return 0
      case 'ASSIGNED':
        return 1
      case 'IN_PROGRESS':
        return 2
      case 'PENDING': // pending is treated as in_progress stage variant
        return 2
      case 'RESOLVED':
        return 3
      case 'CLOSED':
        return 4
      default:
        return 0
    }
  }

  const activeIndex = getStageIndex(currentStatus)

  return (
    <Card sx={{ background: '#111827', p: 3, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 800, mb: 3 }}>
        Incident Lifecycle & Stage Analysis
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          gap: 1.5,
        }}
      >
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIndex
          const isActive = idx === activeIndex
          const isPending = idx > activeIndex

          // Color calculation
          let borderColor = 'rgba(255, 255, 255, 0.04)'
          let bgColor = 'rgba(255, 255, 255, 0.01)'
          let titleColor = '#64748b'

          if (isActive) {
            borderColor = '#3b82f6'
            bgColor = 'rgba(59, 130, 246, 0.08)'
            titleColor = '#3b82f6'
          } else if (isCompleted) {
            borderColor = 'rgba(16, 185, 129, 0.3)'
            bgColor = 'rgba(16, 185, 129, 0.03)'
            titleColor = '#10b981'
          }

          return (
            <React.Fragment key={stage.key}>
              {/* Stage Card */}
              <Box
                className={isActive ? 'neon-border-blue' : ''}
                sx={{
                  flex: 1,
                  minWidth: 100,
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  position: 'relative',
                  textAlign: 'center',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <Typography variant="body2" sx={{ color: titleColor, fontWeight: 800, mb: 1 }}>
                  {stage.label}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                  <Schedule sx={{ fontSize: '11px', color: '#64748b' }} />
                  <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600, fontFamily: 'monospace' }}>
                    {stage.duration}
                  </Typography>
                </Box>
                
                <Typography variant="caption" sx={{ color: '#475569', fontSize: '9px', display: 'block' }}>
                  {stage.details}
                </Typography>

                {/* Highlight queue bottleneck warnings */}
                {stage.key === 'ASSIGNED' && activeIndex === 1 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '8px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      boxShadow: '0 0 6px #ef4444',
                    }}
                  >
                    QUEUE BOTTLENECK
                  </span>
                )}
              </Box>

              {/* Chevron Arrow */}
              {idx < STAGES.length - 1 && (
                <ArrowForwardIos
                  sx={{
                    fontSize: '12px',
                    color: isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                    display: { xs: 'none', md: 'block' },
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </Box>
    </Card>
  )
}
