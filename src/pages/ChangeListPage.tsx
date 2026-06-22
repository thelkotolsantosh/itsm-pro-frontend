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
  Chip,
} from '@mui/material'
import {
  Search,
  Refresh,
  Clear,
  SwapHoriz,
  Visibility,
} from '@mui/icons-material'
import { useChanges } from '@/hooks/useItsm'
import {
  ChangeStatusChip,
  RiskBadge,
  SectionHeader,
  EmptyState,
  ErrorState,
} from '@/components/common/ItsmComponents'
import { formatDateTime } from '@/utils'
import { ChangeRequestResponse } from '@/types/index'

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

export default function ChangeListPage() {
  const navigate = useNavigate()

  // State filters
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchText, setSearchText] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const params = {
    status: statusFilter || undefined,
    search: searchText || undefined,
    page,
    size: rowsPerPage,
  }

  const { data, isLoading, error, refetch } = useChanges(params)

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
    setSearchText('')
    setSearchInput('')
  }

  const handleStatusChange = (val: string) => {
    setPage(0)
    setStatusFilter(val)
  }

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const isFilterActive = statusFilter !== '' || searchText !== ''

  const changes = data?.content ?? []
  const totalElements = data?.totalElements ?? 0

  return (
    <Box>
      {/* Page Title Header */}
      <SectionHeader
        title="Change Requests"
        subtitle="Schedule, review, and control production software deployments or infrastructure upgrades"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<SwapHoriz />}
            onClick={() => navigate('/changes/new')}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
            }}
          >
            New Change
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
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="change-status-filter-label" shrink>Status</InputLabel>
              <Select
                labelId="change-status-filter-label"
                displayEmpty
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                label="Status"
                sx={{
                  '& .MuiSelect-select': { py: '8.5px' },
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="SUBMITTED">Submitted</MenuItem>
                <MenuItem value="CAB_REVIEW">CAB Review</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="IMPLEMENTED">Implemented</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
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

      {/* Changes Table */}
      <TableContainer component={Card} sx={{ background: '#111827', boxShadow: 'none' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ backgroundColor: 'rgba(148, 163, 184, 0.03)' }}>
            <TableRow>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Ticket #</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Risk Level</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Scheduled Start</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Requested By</TableCell>
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
            ) : changes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    title="No change requests found"
                    subtitle="Try altering your search filters or draft a new change plan."
                  />
                </TableCell>
              </TableRow>
            ) : (
              changes.map((change) => (
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
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600 }} noWrap>
                      {change.title}
                    </Typography>
                  </TableCell>

                  {/* Type */}
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

                  {/* Status */}
                  <TableCell>
                    <ChangeStatusChip status={change.status} />
                  </TableCell>

                  {/* Risk */}
                  <TableCell>
                    <RiskBadge riskLevel={change.riskLevel} />
                  </TableCell>

                  {/* Scheduled Start */}
                  <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    {formatDateTime(change.scheduledStart)}
                  </TableCell>

                  {/* Requested By */}
                  <TableCell sx={{ color: '#e2e8f0', fontWeight: 500 }}>
                    {change.createdBy.fullName}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <MuiTooltip title="View Details">
                      <IconButton
                        size="small"
                        sx={{ color: '#60a5fa' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/changes/${change.id}`)
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </MuiTooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
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
