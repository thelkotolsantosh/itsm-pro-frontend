import React, { useState } from 'react'
import { Card, Box, Typography, Divider, Grid2 as Grid } from '@mui/material'

interface SiteData {
  id: string
  name: string
  status: 'GREEN' | 'YELLOW' | 'RED'
  latency: string
  availability: string
  activeIncidents: number
  cx: number
  cy: number
}

const SITES: SiteData[] = [
  { id: '1', name: 'Hyderabad NOC', status: 'GREEN', latency: '14ms', availability: '99.99%', activeIncidents: 0, cx: 530, cy: 235 },
  { id: '2', name: 'Bangalore DC', status: 'GREEN', latency: '8ms', availability: '99.98%', activeIncidents: 0, cx: 520, cy: 255 },
  { id: '3', name: 'Mumbai Edge Office', status: 'YELLOW', latency: '45ms', availability: '99.45%', activeIncidents: 2, cx: 500, cy: 228 },
  { id: '4', name: 'Chennai Hub', status: 'RED', latency: '320ms', availability: '95.12%', activeIncidents: 5, cx: 540, cy: 250 },
  { id: '5', name: 'London Regional', status: 'GREEN', latency: '82ms', availability: '99.95%', activeIncidents: 0, cx: 375, cy: 110 },
  { id: '6', name: 'New York HQ', status: 'GREEN', latency: '114ms', availability: '99.90%', activeIncidents: 1, cx: 220, cy: 125 },
  { id: '7', name: 'Tokyo Office', status: 'GREEN', latency: '135ms', availability: '99.97%', activeIncidents: 0, cx: 680, cy: 155 },
]

const STATUS_COLORS: Record<string, string> = {
  GREEN: '#10b981',
  YELLOW: '#f59e0b',
  RED: '#ef4444',
}

export default function GlobalInfraMap() {
  const [selectedSite, setSelectedSite] = useState<SiteData | null>(SITES[0])

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {/* Map View */}
        <Grid size={{ xs: 12, md: 8.5 }}>
          <Card
            sx={{
              background: '#0a0f1e',
              p: 2,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              position: 'relative',
              height: 380,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', position: 'absolute', top: 8, left: 12 }}>
              GLOBAL INFRASTRUCTURE MAP
            </Typography>

            {/* Schematic SVG Map */}
            <svg width="100%" height="340" viewBox="0 0 800 340" style={{ display: 'block' }}>
              {/* Grid Background */}
              <defs>
                <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid)" />

              {/* Schematic World Outlines (Abstracted vector grids) */}
              {/* North America */}
              <path d="M120,80 L260,80 L290,140 L220,180 L180,180 L140,130 Z" fill="rgba(148, 163, 184, 0.03)" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1.5" />
              {/* South America */}
              <path d="M220,190 L260,195 L290,240 L260,310 L230,310 L210,240 Z" fill="rgba(148, 163, 184, 0.03)" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1.5" />
              {/* Europe & Asia */}
              <path d="M340,90 L480,70 L620,80 L720,120 L700,200 L610,220 L580,240 L530,280 L480,220 L400,200 L340,150 Z" fill="rgba(148, 163, 184, 0.03)" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1.5" />
              {/* Africa */}
              <path d="M360,170 L420,160 L460,200 L440,280 L390,280 L360,200 Z" fill="rgba(148, 163, 184, 0.03)" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1.5" />
              {/* Australia */}
              <path d="M640,240 L700,240 L720,280 L670,290 Z" fill="rgba(148, 163, 184, 0.03)" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="1.5" />

              {/* Connecting Global Network Lines */}
              <path d="M220,125 Q300,100 375,110" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1.5" strokeDasharray="5,5" />
              <path d="M375,110 Q450,150 530,235" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1.5" strokeDasharray="5,5" />
              <path d="M530,235 Q600,180 680,155" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="1.5" strokeDasharray="5,5" />
              <path d="M220,125 Q400,200 530,235" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1.5" strokeDasharray="5,5" />

              {/* Site Pins */}
              {SITES.map((site) => {
                const isSelected = selectedSite?.id === site.id
                const color = STATUS_COLORS[site.status]

                return (
                  <g
                    key={site.id}
                    transform={`translate(${site.cx}, ${site.cy})`}
                    onClick={() => setSelectedSite(site)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Pulsing visual glow */}
                    {site.status !== 'GREEN' && (
                      <circle r={14} fill="none" stroke={color} strokeWidth={1}>
                        <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle
                      r={isSelected ? 7 : 5}
                      fill={color}
                      stroke="#0a0f1e"
                      strokeWidth={1.5}
                      style={{ transition: 'all 0.2s' }}
                    />
                    
                    {/* Small pin label */}
                    <text
                      y={-10}
                      textAnchor="middle"
                      fill={isSelected ? '#3b82f6' : '#94a3b8'}
                      fontSize="9px"
                      fontWeight="bold"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {site.name.split(' ')[0]}
                    </text>
                  </g>
                )
              })}
            </svg>
          </Card>
        </Grid>

        {/* Site Details Card */}
        <Grid size={{ xs: 12, md: 3.5 }}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #111827 0%, #0d1626 100%)',
              p: 3,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: 380,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {selectedSite ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: STATUS_COLORS[selectedSite.status],
                        boxShadow: `0 0 10px ${STATUS_COLORS[selectedSite.status]}`,
                        display: 'inline-block',
                      }}
                      className={
                        selectedSite.status === 'RED'
                          ? 'pulse-red'
                          : selectedSite.status === 'YELLOW'
                          ? 'pulse-yellow'
                          : 'pulse-green'
                      }
                    />
                    <Typography variant="subtitle1" sx={{ color: '#f8fafc', fontWeight: 800 }}>
                      {selectedSite.name}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                      LATENCY:
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: selectedSite.status === 'RED' ? 'error.main' : '#f1f5f9',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                      }}
                    >
                      {selectedSite.latency}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                      AVAILABILITY:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#3b82f6', fontWeight: 700 }}>
                      {selectedSite.availability}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                      ACTIVE INCIDENTS:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: selectedSite.activeIncidents > 0 ? 'warning.main' : 'success.main',
                        fontWeight: 700,
                      }}
                    >
                      {selectedSite.activeIncidents > 0
                        ? `${selectedSite.activeIncidents} active tickets`
                        : '0 active incidents (Normal)'}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" sx={{ color: '#475569', fontStyle: 'italic' }}>
                  * Ping check interval: 5 seconds. Metrics verified globally.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                  Select a regional pin to inspect telemetry
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
