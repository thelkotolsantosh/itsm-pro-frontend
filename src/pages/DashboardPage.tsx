import React, { useState, useEffect } from 'react'
import {
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Button,
  Divider,
} from '@mui/material'
import {
  BugReport,
  CheckCircle,
  Schedule,
  TrendingUp,
  Pending,
  MonitorHeart,
  Language,
  Hub,
  SettingsInputHdmi,
  Fullscreen,
  FullscreenExit,
  AttachMoney,
  People,
  Warning,
  Security,
} from '@mui/icons-material'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { useDashboard } from '@/hooks/useItsm'
import { ErrorState } from '@/components/common/ItsmComponents'
import { PRIORITY_COLORS } from '@/types/index'

// Import New Visual Features
import GlobalInfraMap from '@/components/common/GlobalInfraMap'
import NetworkTopology from '@/components/common/NetworkTopology'
import ServiceDependencyGraph from '@/components/common/ServiceDependencyGraph'
import ThreeJsRackView from '@/components/common/ThreeJsRackView'

const STATUS_COLORS: Record<string, string> = {
  NEW: '#94a3b8',
  ASSIGNED: '#60a5fa',
  IN_PROGRESS: '#fbbf24',
  PENDING: '#a78bfa',
  RESOLVED: '#34d399',
  CLOSED: '#9ca3af',
  CANCELLED: '#6b7280',
}

interface KpiCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtitle?: string
  neonClass?: string
}

function KpiCard({ title, value, icon, color, subtitle, neonClass }: KpiCardProps) {
  return (
    <Card
      className={`glass-panel ${neonClass || ''}`}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: 130,
        backgroundColor: 'rgba(17, 24, 39, 0.45) !important',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: color,
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: `${color}40 !important`,
          boxShadow: `0 8px 30px 0 ${color}15 !important`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#94a3b8',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.72rem',
              letterSpacing: '0.8px',
            }}
          >
            {title}
          </Typography>
          <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        </Box>
        <Typography variant="h4" sx={{ color: '#f1f5f9', fontWeight: 800, mb: 0.5 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.72rem' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          p: 1.5,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600, mb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((item: any, idx: number) => (
          <Typography key={idx} variant="body2" sx={{ color: item.color || '#3b82f6', fontWeight: 700 }}>
            {item.name}: {item.value}
          </Typography>
        ))}
      </Box>
    )
  }
  return null
}

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard(30)
  const [executiveMode, setExecutiveMode] = useState(false)
  const [wallboardMode, setWallboardMode] = useState(false)
  const [infraTab, setInfraTab] = useState(0)

  // Live Incident Feed State (adds random incoming incidents)
  const [liveIncidents, setLiveIncidents] = useState<any[]>([])
  // Activity logs feed
  const [activities, setActivities] = useState<string[]>([
    '🟢 Tech L2 assigned to INC0010003',
    '🔴 P1 incident created: DB replication lag on primary',
    '🟡 SLA Warning triggered for INC0010002',
    '✅ Incident INC0010009 has been resolved',
  ])

  useEffect(() => {
    if (!data) return
    // Pre-populate live feed with a couple of tickets from data
    setLiveIncidents([
      { id: '1', ticketNumber: 'INC0010001', title: 'Prod database unresponsive', priority: 'P1', time: 'Just Now', status: 'IN_PROGRESS' },
      { id: '2', ticketNumber: 'INC0010002', title: 'VPN gateway latency spike', priority: 'P1', time: '2m ago', status: 'ASSIGNED' },
      { id: '3', ticketNumber: 'INC0010003', title: 'Office outbound email bouncing', priority: 'P2', time: '10m ago', status: 'IN_PROGRESS' },
    ])
  }, [data])

  // Simulate real-time incident slide-ins
  useEffect(() => {
    const interval = setInterval(() => {
      const liveAlerts = [
        { ticketNumber: 'INC0010011', title: 'Kubernetes API healthcheck timed out', priority: 'P2', status: 'NEW' },
        { ticketNumber: 'INC0010012', title: 'AD Domain Controller auth sync failure', priority: 'P1', status: 'NEW' },
        { ticketNumber: 'INC0010013', title: 'Backup repository sync breach warning', priority: 'P3', status: 'NEW' },
      ]

      const randomAlert = {
        ...liveAlerts[Math.floor(Math.random() * liveAlerts.length)],
        id: String(Date.now()),
        time: 'Just Now',
      }

      setLiveIncidents((prev) => [randomAlert, ...prev.slice(0, 3)])
      
      // Update activity logs
      const logStatus = randomAlert.priority === 'P1' ? '🔴' : '🟡'
      setActivities((prev) => [
        `${logStatus} New ${randomAlert.priority} ticket created: ${randomAlert.title}`,
        ...prev.slice(0, 4),
      ])
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Box sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton width={220} height={36} />
          <Skeleton width={80} height={32} />
        </Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Array.from(new Array(5)).map((_, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (error || !data) {
    return <ErrorState message={error?.message || 'Failed to load telemetry.'} onRetry={refetch} />
  }

  // MTTR and SLA formatters
  const mttrHrs = data.mttrMinutes > 0 ? (data.mttrMinutes / 60).toFixed(1) + 'h' : '—'
  const slaCompRate = (data.slaComplianceRate * 100).toFixed(1) + '%'

  // Business Executive metrics conversions
  const revenueRisk = (data.p1OpenIncidents * 12500) + (data.openIncidents * 1200)
  const businessAvailability = (data.slaComplianceRate * 100 - 0.12).toFixed(2) + '%'
  const customerSat = 92.5 + (data.slaComplianceRate * 5)
  const usersImpacted = (data.p1OpenIncidents * 240) + (data.openIncidents * 15)

  // Radar chart data: SLA achievement metrics for support teams
  const radarData = [
    { subject: 'Network', SLA: 92, MTTR: 85, Availability: 99 },
    { subject: 'Security', SLA: 98, MTTR: 95, Availability: 100 },
    { subject: 'Database', SLA: 88, MTTR: 70, Availability: 98 },
    { subject: 'Cloud', SLA: 96, MTTR: 90, Availability: 99 },
    { subject: 'Applications', SLA: 90, MTTR: 82, Availability: 99 },
  ]

  return (
    <Box sx={{ p: wallboardMode ? 4 : 0, minHeight: wallboardMode ? '100vh' : 'auto', bgcolor: wallboardMode ? '#070a14' : 'transparent', transition: 'all 0.4s' }}>
      
      {/* Upper Control Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#f1f5f9', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonitorHeart sx={{ color: '#3b82f6' }} />
            {wallboardMode ? 'NOC Operations Wallboard' : executiveMode ? 'Executive IT Command Center' : 'Operations Command Center'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {wallboardMode ? 'Fullscreen TV wall mode · 10s rotate' : 'Cyberpunk Dark Glassmorphism Edition'}
          </Typography>
        </Box>

        {/* Dashboard Mode Switches */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.02)', p: 1, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
          <FormControlLabel
            control={<Switch size="small" checked={executiveMode} onChange={(e) => setExecutiveMode(e.target.checked)} />}
            label={<Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>EXECUTIVE MODE</Typography>}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={wallboardMode ? <FullscreenExit /> : <Fullscreen />}
            onClick={() => setWallboardMode(!wallboardMode)}
            sx={{
              borderColor: 'rgba(255,255,255,0.1)',
              color: '#94a3b8',
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {wallboardMode ? 'Exit Wallboard' : 'Wallboard Mode'}
          </Button>
          <Chip
            label="Live"
            size="small"
            sx={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              fontWeight: 800,
              border: '1px solid rgba(16, 185, 129, 0.2)',
              '&::before': {
                content: '""',
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
                mr: 0.8,
              },
            }}
          />
        </Box>
      </Box>

      {/* KPI Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {!executiveMode ? (
          <>
            {/* Operational Mode Card Metrics */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard
                title="Active Incidents"
                value={data.openIncidents}
                icon={<BugReport />}
                color="#ef4444"
                subtitle={`${data.p1OpenIncidents} critical P1 alerts`}
                neonClass="neon-border-red"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard
                title="SLA Compliance"
                value={slaCompRate}
                icon={<CheckCircle />}
                color="#10b981"
                subtitle={`${data.slaBreachedCount} tickets breached`}
                neonClass="neon-border-green"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard
                title="Avg MTTR"
                value={mttrHrs}
                icon={<Schedule />}
                color="#3b82f6"
                subtitle={`Based on ${data.resolvedInPeriod} resolved`}
                neonClass="neon-border-blue"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard
                title="Queue Health"
                value="99.2%"
                icon={<TrendingUp />}
                color="#06b6d4"
                subtitle="Service Desk capacity normal"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard
                title="Pending Changes"
                value={data.pendingChanges}
                icon={<Pending />}
                color="#f59e0b"
                subtitle="Awaiting CAB reviews"
                neonClass="neon-border-yellow"
              />
            </Grid>
          </>
        ) : (
          <>
            {/* Executive Mode Card Metrics */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard
                title="Revenue At Risk"
                value={`$${revenueRisk.toLocaleString()}`}
                icon={<AttachMoney />}
                color="#ef4444"
                subtitle={`Based on active open items`}
                neonClass="neon-border-red"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard
                title="Business Availability"
                value={businessAvailability}
                icon={<Language />}
                color="#10b981"
                subtitle="Meets target SLA requirements"
                neonClass="neon-border-green"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard
                title="Customer Satisfaction"
                value={`${customerSat.toFixed(1)}%`}
                icon={<People />}
                color="#3b82f6"
                subtitle="Calculated on MTTR score"
                neonClass="neon-border-blue"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard
                title="Users Impacted"
                value={usersImpacted}
                icon={<Warning />}
                color="#f59e0b"
                subtitle="Aggregated client segments"
                neonClass="neon-border-yellow"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <KpiCard
                title="Critical Business Services"
                value="9 / 10"
                icon={<Security />}
                color="#06b6d4"
                subtitle="Billing Gateway degradation"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Main Charts & Live Feed Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left Side: Telemetry / Live Feeds */}
        <Grid size={{ xs: 12, md: 8.5 }}>
          <Card className="glass-panel" sx={{ p: 3, height: 380 }}>
            <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 800, mb: 3 }}>
              Incident Volume Trends
            </Typography>
            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="primaryGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.04)" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Incidents"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#primaryGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Right Side: Live Feeds & Pulse Indicators */}
        <Grid size={{ xs: 12, md: 3.5 }}>
          <Card className="glass-panel" sx={{ p: 2.5, height: 380, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 800, mb: 2 }}>
                Live Operations Feed
              </Typography>
              
              {/* Animated Incident feeds */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                {liveIncidents.map((inc) => (
                  <Box
                    key={inc.id}
                    className="slide-in-feed"
                    sx={{
                      p: 1.2,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${inc.priority === 'P1' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.78rem' }}>
                        {inc.ticketNumber}: {inc.title.length > 24 ? `${inc.title.substring(0, 22)}...` : inc.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {inc.time} · routed L2
                      </Typography>
                    </Box>
                    <Chip
                      label={inc.priority}
                      size="small"
                      sx={{
                        backgroundColor: inc.priority === 'P1' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: inc.priority === 'P1' ? '#f87171' : '#fbbf24',
                        fontWeight: 800,
                        fontSize: '9px',
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Live activity logs ticker */}
            <Box>
              <Divider sx={{ mb: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                System Activity Feed
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {activities.map((act, idx) => (
                  <Typography key={idx} variant="caption" sx={{ color: '#94a3b8', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {act}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Real-time Infrastructure & Topology Panels */}
      <Box sx={{ mb: 4 }}>
        <Card className="glass-panel" sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#f1f5f9', fontWeight: 800 }}>
                Operations Control Panels
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Toggle infrastructure layers, system nodes, and 3D cabinets
              </Typography>
            </Box>

            <Tabs value={infraTab} onChange={(e, val) => setInfraTab(val)} sx={{
              minHeight: 32,
              '& .MuiTab-root': {
                minHeight: 32,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#64748b',
                px: 2.5,
              },
              '& .Mui-selected': {
                color: '#3b82f6 !important',
              },
            }}>
              <Tab icon={<Language sx={{ fontSize: '16px' }} />} iconPosition="start" label="World Map" />
              <Tab icon={<Hub sx={{ fontSize: '16px' }} />} iconPosition="start" label="Network Topology" />
              <Tab icon={<SettingsInputHdmi sx={{ fontSize: '16px' }} />} iconPosition="start" label="Service Graph" />
              <Tab icon={<MonitorHeart sx={{ fontSize: '16px' }} />} iconPosition="start" label="3D Server Racks" />
            </Tabs>
          </Box>

          <Box sx={{ mt: 1, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {infraTab === 0 && <GlobalInfraMap />}
            {infraTab === 1 && <NetworkTopology />}
            {infraTab === 2 && <ServiceDependencyGraph />}
            {infraTab === 3 && (
              <Grid container spacing={3} sx={{ width: '100%' }}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <ThreeJsRackView />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 800 }}>
                      WebGL Rack Telemetry
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: '150%' }}>
                      Live three-dimensional render of local server cabinets. Glowing LEDs represent hardware ping status. Click and drag within the cabinet window to rotate perspective.
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span className="pulse-red" style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                      <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>
                        Alarms: 1 Critical (Database Primary Node Exhausted)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        </Card>
      </Box>

      {/* SLA Metrics grid */}
      <Grid container spacing={3}>
        {/* Radar Analysis */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="glass-panel" sx={{ p: 3, height: 350 }}>
            <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 800, mb: 1 }}>
              SLA Team Capabilities
            </Typography>
            <Box sx={{ width: '100%', height: 260, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.04)" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 8 }} />
                  <Radar name="Performance" dataKey="SLA" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Speed" dataKey="MTTR" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* SLA Heatmap Grid */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="glass-panel" sx={{ p: 3, height: 350 }}>
            <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 800, mb: 2 }}>
              Animated SLA Heatmap (Breach Ratios)
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              {/* Row 1: Network */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>Network Operations Team</Typography>
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700 }}>92% Compliance (Breaching)</Typography>
                </Box>
                <Box sx={{ height: 10, width: '100%', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, overflow: 'hidden' }}>
                  <Box className="pulse-red" sx={{ height: '100%', width: '92%', bgcolor: '#ef4444', borderRadius: 1 }} />
                </Box>
              </Box>

              {/* Row 2: Database */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>Database Administration Team</Typography>
                  <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 700 }}>78% Compliance (Warning)</Typography>
                </Box>
                <Box sx={{ height: 10, width: '100%', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, overflow: 'hidden' }}>
                  <Box className="pulse-yellow" sx={{ height: '100%', width: '78%', bgcolor: '#f59e0b', borderRadius: 1 }} />
                </Box>
              </Box>

              {/* Row 3: Cloud Infrastructure */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>Cloud Operations Team</Typography>
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>98% Compliance (Healthy)</Typography>
                </Box>
                <Box sx={{ height: 10, width: '100%', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, overflow: 'hidden' }}>
                  <Box className="pulse-green" sx={{ height: '100%', width: '98%', bgcolor: '#10b981', borderRadius: 1 }} />
                </Box>
              </Box>

              {/* Row 4: Help Desk */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>Service Help Desk Team</Typography>
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>96% Compliance (Healthy)</Typography>
                </Box>
                <Box sx={{ height: 10, width: '100%', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 1, overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: '96%', bgcolor: '#10b981', borderRadius: 1 }} />
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
