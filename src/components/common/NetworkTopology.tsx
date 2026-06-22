import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Card, Box, Typography, CircularProgress, Alert } from '@mui/material'

interface NodeData {
  id: string
  label: string
  type: 'ROUTER' | 'SWITCH' | 'SERVER' | 'APPLICATION'
  status: 'GREEN' | 'YELLOW' | 'RED'
  ip: string
  details: string
}

interface LinkData {
  source: string
  target: string
}

interface TopologyResponse {
  nodes: NodeData[]
  links: LinkData[]
}

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  '1': { x: 400, y: 35 },
  '2': { x: 400, y: 95 },
  '3': { x: 260, y: 165 },
  '4': { x: 540, y: 165 },
  '5': { x: 180, y: 235 },
  '6': { x: 340, y: 235 },
  '7': { x: 460, y: 235 },
  '8': { x: 620, y: 235 },
  '9': { x: 400, y: 305 },
  '10': { x: 400, y: 375 },
}

const STATUS_COLORS: Record<string, string> = {
  GREEN: '#10b981',
  YELLOW: '#f59e0b',
  RED: '#ef4444',
}

export default function NetworkTopology() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)

  const { data, isLoading, error } = useQuery<TopologyResponse>({
    queryKey: ['network-topology'],
    queryFn: () => axios.get('/api/topology').then((res) => res.data),
    refetchInterval: 15000,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={40} />
      </Box>
    )
  }

  if (error || !data) {
    return <Alert severity="error">Failed to fetch real-time network topology</Alert>
  }

  const nodes = data.nodes
  const links = data.links

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%' }}>
      {/* SVG Canvas */}
      <Card
        sx={{
          flex: 1,
          background: '#0d1322',
          p: 2,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <Typography variant="caption" sx={{ color: '#64748b', position: 'absolute', top: 8, left: 12 }}>
          CISCO DNA / PRTG LIVE FEED
        </Typography>

        <svg width="100%" height="420" viewBox="0 0 800 420" style={{ display: 'block', margin: '0 auto' }}>
          <defs>
            {/* Pulsing glow filter */}
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Animated link dash markers */}
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 2 L 8 5 L 0 8 z" fill="#475569" />
            </marker>
          </defs>

          {/* Draw Links */}
          {links.map((link, idx) => {
            const from = NODE_POSITIONS[link.source]
            const to = NODE_POSITIONS[link.target]
            if (!from || !to) return null

            // Find source node status for link coloring
            const sourceNode = nodes.find((n) => n.id === link.source)
            const strokeColor = sourceNode?.status === 'RED' ? '#ef4444' : sourceNode?.status === 'YELLOW' ? '#fbbf24' : '#1e293b'
            const isBroadcasting = sourceNode?.status !== 'RED'

            return (
              <g key={idx}>
                {/* Background Link Line */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={strokeColor}
                  strokeWidth={2}
                  opacity={sourceNode?.status === 'GREEN' ? 0.3 : 0.8}
                />
                
                {/* Animated Pulsing Stream */}
                {isBroadcasting && (
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={sourceNode?.status === 'YELLOW' ? '#f59e0b' : '#3b82f6'}
                    strokeWidth={2.5}
                    strokeDasharray="6, 12"
                    strokeDashoffset="12"
                    opacity={0.8}
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="100;0"
                      dur={sourceNode?.status === 'YELLOW' ? '4s' : '2s'}
                      repeatCount="indefinite"
                    />
                  </line>
                )}
              </g>
            )
          })}

          {/* Draw Nodes */}
          {nodes.map((node) => {
            const pos = NODE_POSITIONS[node.id]
            if (!pos) return null

            const isSelected = selectedNode?.id === node.id
            const color = STATUS_COLORS[node.status]

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNode(node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer pulsing ring for critical/warnings */}
                {node.status !== 'GREEN' && (
                  <circle
                    r={22}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    opacity={0.6}
                  >
                    <animate
                      attributeName="r"
                      values="15;28;15"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0;0.8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Node Body */}
                <circle
                  r={15}
                  fill={isSelected ? '#3b82f6' : '#1e293b'}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ transition: 'all 0.2s ease-in-out' }}
                />

                {/* Status LED Dot */}
                <circle cx="10" cy="-10" r="4.5" fill={color} />

                {/* Icon symbol representation */}
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fill="#f8fafc"
                  fontSize="9px"
                  fontWeight="bold"
                  style={{ userSelect: 'none' }}
                >
                  {node.type.substring(0, 3)}
                </text>

                {/* Text Label */}
                <text
                  y={28}
                  textAnchor="middle"
                  fill={isSelected ? '#3b82f6' : '#cbd5e1'}
                  fontSize="11px"
                  fontWeight={600}
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
      </Card>

      {/* Selected Node Details sidecard */}
      <Card
        sx={{
          width: { xs: '100%', md: 260 },
          background: 'linear-gradient(135deg, #111827 0%, #0d1626 100%)',
          p: 2.5,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: selectedNode ? 'flex-start' : 'center',
          alignItems: selectedNode ? 'flex-start' : 'center',
          textAlign: selectedNode ? 'left' : 'center',
          minHeight: 200,
        }}
      >
        {selectedNode ? (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: STATUS_COLORS[selectedNode.status],
                  boxShadow: `0 0 10px ${STATUS_COLORS[selectedNode.status]}`,
                }}
              />
              <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 800 }}>
                {selectedNode.label}
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              NODE TYPE:
            </Typography>
            <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, mb: 1.5 }}>
              {selectedNode.type}
            </Typography>

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              IP / ENDPOINT:
            </Typography>
            <Typography variant="body2" sx={{ color: '#3b82f6', fontFamily: 'monospace', fontWeight: 600, mb: 1.5 }}>
              {selectedNode.ip}
            </Typography>

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
              STATUS DETAILS:
            </Typography>
            <Typography variant="body2" sx={{ color: selectedNode.status === 'RED' ? 'error.main' : '#cbd5e1' }}>
              {selectedNode.details}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
              Select a node in the topology map to inspect live metrics
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  )
}
