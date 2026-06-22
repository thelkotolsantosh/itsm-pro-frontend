import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Container } from '@mui/material'
import { ArrowBack, Home } from '@mui/icons-material'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, #0f172a 0%, #020617 100%)',
        textAlign: 'center',
        color: '#f1f5f9',
        px: 2,
      }}
    >
      <Container maxWidth="xs">
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '6rem', sm: '8rem' },
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            mb: 1,
          }}
        >
          404
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{
            fontFamily: 'monospace',
            color: 'primary.main',
            fontWeight: 700,
            letterSpacing: '1px',
            mb: 3,
          }}
        >
          ERR0000404: TICKET_NOT_FOUND
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
          Page Not Found
        </Typography>

        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4 }}>
          The page you are looking for does not exist, has been archived, or you do not have permission to view it.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Home />}
            onClick={() => navigate('/dashboard')}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              color: '#fff',
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
