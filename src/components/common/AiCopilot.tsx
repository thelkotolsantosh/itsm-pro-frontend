import React, { useState, useEffect, useRef } from 'react'
import { Card, Box, Typography, TextField, IconButton, Button, Chip } from '@mui/material'
import { SmartToy, Send, Close, Mic } from '@mui/icons-material'

interface Message {
  sender: 'user' | 'system'
  text: string
}

const PRESET_QUERIES = [
  'Show all critical incidents',
  'Which team has highest MTTR?',
  'Summarize open incidents',
  'Show impacted services',
]

export default function AiCopilot() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'system', text: 'Hello! I am your AI Operations Copilot. Ask me questions about active tickets, network outages, SLA metrics, or Root Cause Analysis (RCA).' },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Custom voice event listener
  useEffect(() => {
    const handleVoiceCommand = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string }>
      if (customEvent.detail && customEvent.detail.text) {
        setIsOpen(true)
        handleUserQuery(customEvent.detail.text)
      }
    }
    window.addEventListener('voice-copilot-query', handleVoiceCommand)
    return () => {
      window.removeEventListener('voice-copilot-query', handleVoiceCommand)
    }
  }, [])

  const handleUserQuery = (query: string) => {
    if (!query.trim()) return

    const userMessage: Message = { sender: 'user', text: query }
    setMessages((prev) => [...prev, userMessage])
    setInputText('')

    // Generate Response based on NLP query matching
    setTimeout(() => {
      let reply = "I'm analyzing that query. Here is what I found in your operations logs:"
      const q = query.toLowerCase()

      if (q.includes('critical') || q.includes('p1')) {
        reply = 'There are currently 2 active critical P1 incidents: INC0000101 (Database server connection timeout in prod) assigned to DBA, and INC0000102 (Slow VPN connection speeds in EU region) assigned to NOC.'
      } else if (q.includes('mttr') || q.includes('resolution')) {
        reply = 'Based on the last 30 days of data, the Database Administration team has the highest Mean Time to Resolution (MTTR) at 4.2 hours, followed by Network Operations at 3.1 hours.'
      } else if (q.includes('summar') || q.includes('open')) {
        reply = 'We currently have 4 open incidents. 2 are critical P1 alerts, 1 is P2 active, and 1 is P3 security phishing report. 75% are on track, while 25% (INC0000102) is at risk of breach.'
      } else if (q.includes('impact') || q.includes('service') || q.includes('blast')) {
        reply = 'Critical database and network nodes are currently experiencing issues, causing downstream outages on the Web Portal application and latency on the Billing Gateway.'
      } else if (q.includes('rca') || q.includes('root cause')) {
        reply = 'Generated RCA suggestion for INC0000101: Primary database connection pool leaked during peak reporting export cycle. Restart container and increase pool size.'
      }

      setMessages((prev) => [...prev, { sender: 'system', text: reply }])
    }, 800)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUserQuery(inputText)
    }
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {/* Floating button */}
      {!isOpen && (
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            width: 56,
            height: 56,
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
            transition: 'all 0.3s',
          }}
          className="pulse-green"
        >
          <SmartToy />
        </IconButton>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card
          className="glass-panel"
          sx={{
            width: 320,
            height: 440,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(17, 24, 39, 0.75) !important',
            border: '1px solid rgba(59, 130, 246, 0.3) !important',
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy sx={{ color: '#3b82f6' }} />
              <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 800 }}>
                AI Operations Copilot
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#64748b' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages log */}
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {messages.map((m, idx) => {
              const isUser = m.sender === 'user'
              return (
                <Box
                  key={idx}
                  sx={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    backgroundColor: isUser ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                    color: isUser ? '#ffffff' : '#e2e8f0',
                    p: 1.2,
                    borderRadius: isUser ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    border: isUser ? 'none' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: '140%' }}>
                    {m.text}
                  </Typography>
                </Box>
              )
            })}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick presets */}
          <Box sx={{ px: 2, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {PRESET_QUERIES.map((q, idx) => (
              <Chip
                key={idx}
                label={q.length > 28 ? `${q.substring(0, 26)}..` : q}
                onClick={() => handleUserQuery(q)}
                size="small"
                sx={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  color: '#60a5fa',
                  fontSize: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  },
                }}
              />
            ))}
          </Box>

          {/* Input field */}
          <Box sx={{ p: 2, display: 'flex', gap: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <TextField
              placeholder="Ask Copilot..."
              size="small"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              fullWidth
              slotProps={{
                htmlInput: {
                  style: {
                    fontSize: '0.82rem',
                    color: '#f8fafc',
                  },
                },
              }}
              sx={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 1,
              }}
            />
            <IconButton onClick={() => handleUserQuery(inputText)} sx={{ backgroundColor: '#3b82f6', color: '#ffffff', '&:hover': { backgroundColor: '#2563eb' } }}>
              <Send fontSize="small" />
            </IconButton>
          </Box>
        </Card>
      )}
    </Box>
  )
}
