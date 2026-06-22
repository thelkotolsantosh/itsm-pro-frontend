import React, { useState } from 'react'
import { Card, Box, Typography, Button, TextField, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Divider, IconButton, Grid2 as Grid } from '@mui/material'
import { Send, Group, Handyman, Security, Gavel, CheckCircle } from '@mui/icons-material'

interface Participant {
  name: string
  role: string
  team: string
  avatar: string
}

interface ChatMessage {
  id: number
  sender: string
  text: string
  timestamp: string
}

interface Decision {
  id: number
  text: string
  decidedBy: string
  timestamp: string
}

const INITIAL_PARTICIPANTS: Participant[] = [
  { name: 'System Administrator', role: 'Commander', team: 'Cloud Infrastructure', avatar: 'A' },
  { name: 'Operations Manager', role: 'Liason', team: 'Operations Management', avatar: 'M' },
  { name: 'David Chang', role: 'Investigator', team: 'Database Administration', avatar: 'D' },
  { name: 'Bob Johnson', role: 'Investigator', team: 'Network Operations', avatar: 'B' },
]

export default function IncidentWarRoom() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'Operations Manager', text: 'War Room initiated. High priority DB pool deadlock suspected.', timestamp: '14:30' },
    { id: 2, sender: 'David Chang', text: 'Inspecting Hikari connection logs. CPU usage on db-primary is at 95%.', timestamp: '14:32' },
    { id: 3, sender: 'Bob Johnson', text: 'Checked WAN gateway routing. Packet loss is clean. Database issue isolated.', timestamp: '14:35' },
  ])
  const [decisions, setDecisions] = useState<Decision[]>([
    { id: 1, text: 'Enable read-only secondary replica query routing', decidedBy: 'System Administrator', timestamp: '14:34' },
  ])
  const [inputText, setInputText] = useState('')
  const [decisionText, setDecisionText] = useState('')

  const handleSendMessage = () => {
    if (!inputText.trim()) return
    const newMsg: ChatMessage = {
      id: messages.length + 1,
      sender: 'System Administrator',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, newMsg])
    setInputText('')
  }

  const handleAddDecision = () => {
    if (!decisionText.trim()) return
    const newDec: Decision = {
      id: decisions.length + 1,
      text: decisionText,
      decidedBy: 'System Administrator',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setDecisions((prev) => [...prev, newDec])
    setDecisionText('')
  }

  return (
    <Card sx={{ background: '#0a0f1e', p: 3, border: '1px solid rgba(239, 68, 68, 0.25)', boxShadow: '0 0 15px rgba(239, 68, 68, 0.08)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 12px #ef4444',
              display: 'inline-block',
            }}
            className="pulse-red"
          />
          <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 800 }}>
            Incident War Room (Active P1 INC0000101)
          </Typography>
        </Box>
        <Chip label="Bridge Active (00:15:34)" color="error" variant="outlined" sx={{ fontWeight: 700 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Left column: Participant roster */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ background: '#111827', p: 2, border: '1px solid rgba(255,255,255,0.05)', height: 350, overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Group sx={{ color: '#3b82f6', fontSize: '18px' }} />
              <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
                Active Responders
              </Typography>
            </Box>
            <List dense>
              {INITIAL_PARTICIPANTS.map((p, idx) => (
                <ListItem key={idx} sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#3b82f6', width: 28, height: 28, fontSize: '0.8rem' }}>
                      {p.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                        {p.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {p.role} · {p.team}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Center column: Live Chat bridge */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ background: '#111827', p: 2, border: '1px solid rgba(255,255,255,0.05)', height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              {messages.map((m) => {
                const isMe = m.sender === 'System Administrator'
                return (
                  <Box key={m.id} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.25, textAlign: isMe ? 'right' : 'left' }}>
                      {m.sender} · {m.timestamp}
                    </Typography>
                    <Box sx={{
                      bgcolor: isMe ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: '#f8fafc',
                      p: 1.2,
                      borderRadius: isMe ? '8px 8px 0 8px' : '8px 8px 8px 0',
                      border: `1px solid ${isMe ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: '140%' }}>
                        {m.text}
                      </Typography>
                    </Box>
                  </Box>
                )
              })}
            </Box>
            
            {/* Input message */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Broadcast to war room..."
                size="small"
                fullWidth
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                slotProps={{
                  htmlInput: { style: { fontSize: '0.8rem', color: '#f1f5f9' } }
                }}
              />
              <IconButton onClick={handleSendMessage} sx={{ bgcolor: '#ef4444', color: '#ffffff', '&:hover': { bgcolor: '#dc2626' } }}>
                <Send fontSize="small" />
              </IconButton>
            </Box>
          </Card>
        </Grid>

        {/* Right column: Decisions & Resolution tracker */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ background: '#111827', p: 2, border: '1px solid rgba(255,255,255,0.05)', height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Gavel sx={{ color: '#f59e0b', fontSize: '18px' }} />
                <Typography variant="subtitle2" sx={{ color: '#f1f5f9', fontWeight: 700 }}>
                  Decisions Logged
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {decisions.map((d) => (
                  <Box key={d.id} sx={{ p: 1, border: '1px solid rgba(245,158,11,0.2)', bgcolor: 'rgba(245,158,11,0.03)', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 600 }}>
                      ⚠️ {d.text}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5 }}>
                      Logged by {d.decidedBy} at {d.timestamp}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Input decision */}
            <Box sx={{ display: 'flex', gap: 1, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <TextField
                placeholder="Log critical decision..."
                size="small"
                fullWidth
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDecision()}
                slotProps={{
                  htmlInput: { style: { fontSize: '0.78rem', color: '#f1f5f9' } }
                }}
              />
              <Button size="small" variant="contained" color="warning" onClick={handleAddDecision} sx={{ fontWeight: 700, fontSize: '0.72rem' }}>
                Log
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Card>
  )
}
