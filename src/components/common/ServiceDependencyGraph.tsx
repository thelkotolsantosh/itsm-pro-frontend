import React, { useState } from 'react'
import { Card, Box, Typography, Chip } from '@mui/material'

interface DependencyNode {
  id: string
  label: string
  parent?: string
  status: 'GREEN' | 'YELLOW' | 'RED'
  incidents: number
  depth: number
  x: number
  y: number
}

const NODES: DependencyNode[] = [
  // Root Level (Depth 0)
  { id: '1', label: 'Enterprise Stack', status: 'YELLOW', incidents: 3, depth: 0, x: 100, y: 150 },
  
  // Level 1 (Depth 1)
  { id: '2', label: 'Office 365', status: 'GREEN', parent: '1', incidents: 0, depth: 1, x: 260, y: 70 },
  { id: '3', label: 'AWS Cloud', status: 'RED', parent: '1', incidents: 2, depth: 1, x: 260, y: 150 },
  { id: '4', label: 'ERP Custom Gateway', status: 'YELLOW', parent: '1', incidents: 1, depth: 1, x: 260, y: 230 },

  // Level 2 (Depth 2) - Office 365 Children
  { id: '2-1', label: 'Exchange Mail', status: 'GREEN', parent: '2', incidents: 0, depth: 2, x: 420, y: 40 },
  { id: '2-2', label: 'MS Teams Portal', status: 'GREEN', parent: '2', incidents: 0, depth: 2, x: 420, y: 90 },

  // Level 2 (Depth 2) - AWS Children
  { id: '3-1', label: 'EC2 Web Instances', status: 'GREEN', parent: '3', incidents: 0, depth: 2, x: 420, y: 130 },
  { id: '3-2', label: 'RDS Database Node', status: 'RED', parent: '3', incidents: 2, depth: 2, x: 420, y: 175 },

  // Level 2 (Depth 2) - ERP Children
  { id: '4-1', label: 'Billing Stripe API', status: 'GREEN', parent: '4', incidents: 0, depth: 2, x: 420, y: 220 },
  { id: '4-2', label: 'Auth0 Directory', status: 'YELLOW', parent: '4', incidents: 1, depth: 2, x: 420, y: 265 },
]

const STATUS_COLORS: Record<string, string> = {
  GREEN: '#10b981',
  YELLOW: '#f59e0b',
  RED: '#ef4444',
}

export default function ServiceDependencyGraph() {
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(NODES[7]) // default to RDS Database Node

  // Render SVG links connecting parents to children
  const renderLinks = () => {
    return NODES.filter((node) => node.parent).map((node) => {
      const parentNode = NODES.find((n) => n.id === node.parent)
      if (!parentNode) return null

      // Draw horizontal-first elbow paths for clean tree-node diagrams
      const pathData = `M ${parentNode.x + 80} ${parentNode.y} 
                        H ${(parentNode.x + node.x) / 2} 
                        V ${node.y} 
                        H ${node.x - 10}`

      const strokeColor = node.status === 'RED' ? '#ef4444' : node.status === 'YELLOW' ? '#fbbf24' : '#1e293b'

      return (
        <path
          key={node.id}
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
          opacity={0.6}
        />
      )
    })
  }

  return (
    <Card sx={{ background: '#0a0f1e', p: 3, border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>
      <Typography variant="caption" sx={{ color: '#64748b', position: 'absolute', top: 8, left: 12 }}>
        BLAST RADIUS & DEPENDENCY MAP
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 1 }}>
        {/* Tree Canvas */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <svg width="600" height="300" viewBox="0 0 600 300">
            {renderLinks()}

            {/* Render Nodes */}
            {NODES.map((node) => {
              const isSelected = selectedNode?.id === node.id
              const color = STATUS_COLORS[node.status]

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Node container card */}
                  <rect
                    x={-10}
                    y={-18}
                    width={110}
                    height={36}
                    rx={6}
                    fill="#111827"
                    stroke={isSelected ? '#3b82f6' : 'rgba(255,255,255,0.06)'}
                    strokeWidth={isSelected ? 2 : 1}
                  />

                  {/* Left status glow bar */}
                  <rect
                    x={-10}
                    y={-18}
                    width={4}
                    height={36}
                    rx={2}
                    fill={color}
                  />

                  {/* Node Label Text */}
                  <text
                    x={4}
                    y={2}
                    fill="#f8fafc"
                    fontSize="9.5px"
                    fontWeight="bold"
                  >
                    {node.label.length > 17 ? `${node.label.substring(0, 15)}..` : node.label}
                  </text>

                  {/* Small subtext showing active tickets */}
                  {node.incidents > 0 && (
                    <text x={4} y={12} fill="#ef4444" fontSize="8px" fontWeight="bold">
                      ⚠️ {node.incidents} Incidents
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </Box>

        {/* Node Inspector Side panel */}
        <Box
          sx={{
            width: { xs: '100%', md: 200 },
            background: 'rgba(17, 24, 39, 0.45)',
            border: '1px solid rgba(255,255,255,0.05)',
            p: 2,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {selectedNode ? (
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 800, mb: 1 }}>
                {selectedNode.label}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={selectedNode.status}
                  size="small"
                  sx={{
                    backgroundColor: `rgba(${selectedNode.status === 'RED' ? '239,68,68' : selectedNode.status === 'YELLOW' ? '245,158,11' : '16,185,129'}, 0.1)`,
                    color: STATUS_COLORS[selectedNode.status],
                    fontWeight: 700,
                    fontSize: '9px',
                    borderRadius: 1,
                  }}
                />
                <Chip
                  label={`Layer ${selectedNode.depth}`}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#94a3b8',
                    fontWeight: 600,
                    fontSize: '9px',
                    borderRadius: 1,
                  }}
                />
              </Box>

              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                BLAST RADIUS IMPACT:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: selectedNode.status === 'RED' ? 'error.main' : selectedNode.status === 'YELLOW' ? 'warning.main' : 'success.main',
                  fontWeight: 700,
                }}
              >
                {selectedNode.status === 'RED'
                  ? 'CRITICAL · Cascading issues to Billing Portal & AWS instances'
                  : selectedNode.status === 'YELLOW'
                  ? 'WARNING · Latency propagation warning'
                  : 'NORMAL · No downstream impact'}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
              Select a dependency node
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  )
}
