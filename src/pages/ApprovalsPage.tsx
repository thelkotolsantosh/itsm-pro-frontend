import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Typography,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material'
import { Approval, RateReview } from '@mui/icons-material'
import { usePendingApprovals } from '@/hooks/useItsm'
import {
  RiskBadge,
  SectionHeader,
  ErrorState,
} from '@/components/common/ItsmComponents'
import { formatDateTime } from '@/utils'

function TableSkeleton() {
  return (
    <>
      {Array.from(new Array(3)).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {Array.from(new Array(7)).map((_, colIdx) => (
            <TableCell key={colIdx}>
              <Skeleton variant="text" width="70%" height={24} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default function ApprovalsPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = usePendingApprovals()

  const pendingChanges = data?.content ?? []
  const count = data?.totalElements ?? 0

  return (
    <Box>
      {/* Page Header with count badge */}
      <SectionHeader
        title="Pending Approvals"
        subtitle="Review change requests and record CAB decisions"
        action={
          !isLoading &&
          count > 0 && (
            <Chip
              label={`${count} Awaiting`}
              color="warning"
              sx={{ fontWeight: 700, borderRadius: 1.5 }}
            />
          )
        }
      />

      {/* Main Content Area */}
      {isLoading ? (
        <TableContainer component={Card} sx={{ background: '#111827' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Skeleton width={50} /></TableCell>
                <TableCell><Skeleton width={150} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell align="right"><Skeleton width={80} /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableSkeleton />
            </TableBody>
          </Table>
        </TableContainer>
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : pendingChanges.length === 0 ? (
        <Alert
          severity="success"
          icon={<Approval />}
          sx={{
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            color: '#f1f5f9',
            '& .MuiAlert-icon': {
              color: '#10b981',
            },
            borderRadius: 2,
            p: 3,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            All caught up!
          </Typography>
          No pending approvals — all CAB tasks are completed.
        </Alert>
      ) : (
        <TableContainer component={Card} sx={{ background: '#111827', boxShadow: 'none' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: 'rgba(148, 163, 184, 0.03)' }}>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Ticket #</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Risk Level</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Scheduled Date</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Requested By</TableCell>
                <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingChanges.map((change) => (
                <TableRow
                  key={change.id}
                  hover
                  onClick={() => navigate(`/changes/${change.id}`)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.04) !important',
                    },
                    transition: 'background-color 0.2s',
                  }}
                >
                  {/* Ticket # */}
                  <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#60a5fa' }}>
                    {change.ticketNumber}
                  </TableCell>

                  {/* Title */}
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600 }} noWrap>
                      {change.title}
                    </Typography>
                  </TableCell>

                  {/* Type Chip */}
                  <TableCell>
                    <Chip
                      label={change.changeType}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(96, 165, 250, 0.12)',
                        color: '#60a5fa',
                        fontWeight: 600,
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>

                  {/* Risk */}
                  <TableCell>
                    <RiskBadge riskLevel={change.riskLevel} />
                  </TableCell>

                  {/* Scheduled date */}
                  <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    {formatDateTime(change.scheduledStart)}
                  </TableCell>

                  {/* Requested by */}
                  <TableCell sx={{ color: '#e2e8f0', fontWeight: 500 }}>
                    {change.createdBy.fullName}
                  </TableCell>

                  {/* Review Button */}
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={<RateReview />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/changes/${change.id}`)
                      }}
                      sx={{
                        boxShadow: 'none',
                        textTransform: 'none',
                      }}
                    >
                      Review & Decide
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
