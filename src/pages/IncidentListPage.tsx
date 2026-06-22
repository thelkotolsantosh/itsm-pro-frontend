import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Skeleton,
  Tooltip as MuiTooltip,
} from '@mui/material'
import {
  Search,
  Refresh,
  Clear,
  BugReport,
  Visibility,
} from '@mui/icons-material'
import { useIncidents } from '@/hooks/useItsm'
import {
  PriorityChip,
  IncidentStatusChip,
  SectionHeader,
  EmptyState,
  ErrorState,
} from '@/components/common/ItsmComponents'
import { formatDateTime } from '@/utils'
import { IncidentResponse, IncidentStatus, Priority } from '@/types/index'

// Inline SLA Countdown chip helper
function SlaBadge({ incident }: { incident: IncidentResponse }) {
  const isActive = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING'].includes(incident.status)
  if (!isActive) return null

  const isBreached = incident.slaStatus === 'BREACHED' || incident.slaMinutesRemaining <= 0
  
  if (isBreached) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontWeight: 700,
          fontSize: '0.75rem',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          animation: 'sla-badge-pulse 2s infinite ease-in-out',
          '@keyframes sla-badge-pulse': {
            '0%': { opacity: 0.75 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.75 },
          },
        }}
      >
        ⚠ BREACHED
      </Box>
    )
  }

  const isAtRisk = incident.slaStatus === 'AT_RISK' || incident.slaMinutesRemaining <= 60
  const color = isAtRisk ? '#fbbf24' : '#34d399'
  const bg = isAtRisk ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)'
  
  const min = incident.slaMinutesRemaining
  const text = min > 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: bg,
        color,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
    >
      {text}
    </Box>
  )
}

function TableSkeleton() {
  return (
    <>
      {Array.from(new Array(5)).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {Array.from(new Array(8)).map((_, colIdx) => (
            <TableCell key={colIdx}>
              <Skeleton variant="text" width={colIdx === 1 ? '90%' : '60%'} height={24} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default function IncidentListPage() {
  const navigate = useNavigate()

  // State filters
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const params = {
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    search: searchText || undefined,
    page,
    size: rowsPerPage,
    sort: 'createdAt,desc', // Default sort new tickets first
  }

  const { data, isLoading, error, refetch } = useIncidents(params)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setSearchText(searchInput)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPage(0)
      setSearchText(searchInput)
    }
  }

  const handleClearFilters = () => {
    setPage(0)
    setStatusFilter('')
    setPriorityFilter('')
    setSearchText('')
    setSearchInput('')
  }

  const handleStatusChange = (val: string) => {
    setPage(0)
    setStatusFilter(val)
  }

  const handlePriorityChange = (val: string) => {
    setPage(0)
    setPriorityFilter(val)
  }

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const isFilterActive = statusFilter !== '' || priorityFilter !== '' || searchText !== ''

  const incidents = data?.content ?? []
  const totalElements = data?.totalElements ?? 0

  return (
    <Box>
      {/* Page Title Header */}
      <SectionHeader
        title="Incidents"
        subtitle="Manage and track application, security, or infrastructure disruptions"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<BugReport />}
            onClick={() => navigate('/incidents/new')}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
            }}
          >
            New Incident
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card sx={{ background: '#111827', p: 2, mb: 3 }}>
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by ticket #, title, or user..."
              size="small"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#64748b', fontSize: '1.2rem' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 260, flexGrow: 1, maxWidth: 400 }}
            />

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label" shrink>Status</InputLabel>
              <Select
                labelId="status-filter-label"
                displayEmpty
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                label="Status"
                sx={{
                  '& .MuiSelect-select': { py: '8.5px' },
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="NEW">New</MenuItem>
                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>

            {/* Priority Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="priority-filter-label" shrink>Priority</InputLabel>
              <Select
                labelId="priority-filter-label"
                displayEmpty
                value={priorityFilter}
                onChange={(e) => handlePriorityChange(e.target.value)}
                label="Priority"
                sx={{
                  '& .MuiSelect-select': { py: '8.5px' },
                }}
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="P1">P1 — Critical</MenuItem>
                <MenuItem value="P2">P2 — High</MenuItem>
                <MenuItem value="P3">P3 — Medium</MenuItem>
                <MenuItem value="P4">P4 — Low</MenuItem>
              </Select>
            </FormControl>

            <Button type="submit" variant="contained" color="secondary" size="medium">
              Search
            </Button>

            {isFilterActive && (
              <Button
                variant="text"
                color="inherit"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                sx={{ color: '#94a3b8' }}
              >
                Clear
              </Button>
            )}
          </Box>

          <IconButton onClick={() => refetch()} sx={{ color: '#94a3b8' }}>
            <Refresh />
          </IconButton>
        </Box>
      </Card>

      {/* Incidents Table */}
      <TableContainer component={Card} sx={{ background: '#111827', boxShadow: 'none' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ backgroundColor: 'rgba(148, 163, 184, 0.03)' }}>
            <TableRow>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Ticket #</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Title & Category</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Priority</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>SLA</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Assigned To</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Created</TableCell>
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
            ) : incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    title="No incidents found"
                    subtitle="Try altering your search filters or create a new incident ticket."
                  />
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => {
                const isP1 = incident.priority === 'P1'
                return (
                  <TableRow
                    key={incident.id}
                    hover
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                    sx={{
                      cursor: 'pointer',
                      borderLeft: isP1 ? '3px solid #ef4444' : '3px solid transparent',
                      backgroundColor: isP1 ? 'rgba(239, 68, 68, 0.02)' : 'inherit',
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.04) !important',
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {/* Ticket # */}
                    <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#60a5fa' }}>
                      {incident.ticketNumber}
                    </TableCell>

                    {/* Title & Category */}
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600 }} noWrap>
                        {incident.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                        {incident.category} {incident.subcategory ? `> ${incident.subcategory}` : ''}
                      </Typography>
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      <PriorityChip priority={incident.priority} />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <IncidentStatusChip status={incident.status} />
                    </TableCell>

                    {/* SLA countdown */}
                    <TableCell>
                      <SlaBadge incident={incident} />
                    </TableCell>

                    {/* Assigned To */}
                    <TableCell>
                      {incident.assignedTo ? (
                        <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 500 }}>
                          {incident.assignedTo.fullName}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'warning.main', fontStyle: 'italic', fontWeight: 500 }}>
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>

                    {/* Created date */}
                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {formatDateTime(incident.createdAt)}
                    </TableCell>

                    {/* Actions view link */}
                    <TableCell align="right">
                      <MuiTooltip title="View Details">
                        <IconButton
                          size="small"
                          sx={{ color: '#60a5fa' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/incidents/${incident.id}`)
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </MuiTooltip>
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
    </Box>
  )
}
