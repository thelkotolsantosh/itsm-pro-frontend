import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Badge,
  Chip,
} from '@mui/material'
import {
  Dashboard,
  BugReport,
  SwapHoriz,
  Approval,
  People,
  Menu as MenuIcon,
  ChevronLeft,
  Logout,
  AccountCircle,
  NotificationsOutlined,
  Mic,
  MicOff,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import AiCopilot from '@/components/common/AiCopilot'

const DRAWER_WIDTH = 260
const COLLAPSED_DRAWER_WIDTH = 72

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [isListening, setIsListening] = useState(false)

  // Global voice commands using Web Speech API
  useEffect(() => {
    if (!isListening) return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser.')
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log('Voice recognition active. Listening...')
    }

    recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1
      const spokenText = event.results[lastResultIndex][0].transcript.trim().toLowerCase()
      console.log('Command recognized:', spokenText)

      if (spokenText.includes('go to dashboard')) {
        navigate('/dashboard')
      } else if (spokenText.includes('go to incidents') || spokenText.includes('go to incident list')) {
        navigate('/incidents')
      } else if (spokenText.includes('go to changes') || spokenText.includes('go to change list')) {
        navigate('/changes')
      } else if (spokenText.includes('go to approvals') || spokenText.includes('go to my approvals')) {
        navigate('/approvals')
      } else if (spokenText.includes('go to users') || spokenText.includes('go to user management')) {
        navigate('/admin/users')
      } else if (spokenText.includes('go to profile')) {
        navigate('/profile')
      } else if (spokenText.includes('open copilot') || spokenText.includes('show copilot')) {
        window.dispatchEvent(
          new CustomEvent('voice-copilot-query', {
            detail: { text: '' },
          })
        )
      } else if (spokenText.startsWith('ask copilot')) {
        const queryText = spokenText.replace('ask copilot', '').trim()
        window.dispatchEvent(
          new CustomEvent('voice-copilot-query', {
            detail: { text: queryText },
          })
        )
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()

    return () => {
      recognition.stop()
    }
  }, [isListening, navigate])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = () => {
    handleMenuClose()
    logout()
    navigate('/login')
  }

  // Get active title based on location
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path.startsWith('/incidents/new')) return 'Create Incident'
    if (path.startsWith('/incidents/')) return 'Incident Details'
    if (path === '/incidents') return 'Incidents List'
    if (path.startsWith('/changes/new')) return 'Create Change Request'
    if (path.startsWith('/changes/')) return 'Change Request Details'
    if (path === '/changes') return 'Change Requests'
    if (path === '/approvals') return 'My Approvals'
    if (path === '/admin/users') return 'User Management'
    if (path === '/profile') return 'User Profile'
    return 'IT Service Management'
  }

  // Navigation logic
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: [] },
    { text: 'Incidents', icon: <BugReport />, path: '/incidents', roles: [] },
    { text: 'Changes', icon: <SwapHoriz />, path: '/changes', roles: [] },
    {
      text: 'Approvals',
      icon: <Approval />,
      path: '/approvals',
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    },
    {
      text: 'Users',
      icon: <People />,
      path: '/admin/users',
      roles: ['ROLE_ADMIN'],
    },
  ]

  const filteredMenuItems = menuItems.filter(
    (item) => item.roles.length === 0 || (user && item.roles.includes(user.role))
  )

  const currentWidth = drawerOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0f1e' }}>
      {/* Topbar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${currentWidth}px)`,
          ml: `${currentWidth}px`,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          backgroundColor: '#0d1626',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: 'none',
          backgroundImage: 'none',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!drawerOpen && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 1, color: '#94a3b8' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
              {getPageTitle()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={isListening ? "Listening... Speak navigation commands" : "Enable Voice Control"}>
              <IconButton
                onClick={() => setIsListening(!isListening)}
                className={isListening ? 'pulse-glow-red' : ''}
                sx={{
                  color: isListening ? '#ef4444' : '#94a3b8',
                  backgroundColor: isListening ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                }}
              >
                {isListening ? <Mic /> : <MicOff />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton sx={{ color: '#94a3b8' }}>
                <Badge badgeContent={3} color="primary">
                  <NotificationsOutlined />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account profile">
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#f1f5f9',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    width: 36,
                    height: 36,
                  }}
                >
                  {user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    backgroundColor: '#111827',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.4)',
                    color: '#f1f5f9',
                    minWidth: 160,
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose()
                  navigate('/profile')
                }}
                sx={{ gap: 1.5, py: 1 }}
              >
                <AccountCircle sx={{ color: '#94a3b8', fontSize: '1.25rem' }} />
                Profile
              </MenuItem>
              <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />
              <MenuItem onClick={handleSignOut} sx={{ gap: 1.5, py: 1, color: '#ef4444' }}>
                <Logout sx={{ fontSize: '1.25rem' }} />
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: currentWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentWidth,
            boxSizing: 'border-box',
            backgroundColor: '#0d1626',
            borderRight: '1px solid rgba(148, 163, 184, 0.1)',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: drawerOpen ? 'space-between' : 'center',
            p: 2,
            minHeight: 64,
          }}
        >
          {drawerOpen ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 0.5,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)',
                }}
              >
                ITSM
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#f1f5f9',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  letterSpacing: '0.5px',
                }}
              >
                Pro
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                borderRadius: 1,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.75rem',
              }}
            >
              IT
            </Box>
          )}

          {drawerOpen && (
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#94a3b8' }}>
              <ChevronLeft />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />

        {/* Navigation List */}
        <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1.5,
                    px: drawerOpen ? 2 : 1.5,
                    py: 1.25,
                    minHeight: 48,
                    justifyContent: drawerOpen ? 'initial' : 'center',
                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
                    color: isActive ? '#3b82f6' : '#94a3b8',
                    '&:hover': {
                      backgroundColor: 'rgba(148, 163, 184, 0.05)',
                      color: isActive ? '#3b82f6' : '#f1f5f9',
                      '& .MuiListItemIcon-root': {
                        color: isActive ? '#3b82f6' : '#f1f5f9',
                      },
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: drawerOpen ? 2 : 'auto',
                      justifyContent: 'center',
                      color: isActive ? '#3b82f6' : '#94a3b8',
                      transition: 'color 0.2s',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {drawerOpen && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.9rem',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>

        <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />

        {/* Footer User Info Panel */}
        {user && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 72 }}>
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                width: 36,
                height: 36,
              }}
            >
              {user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </Avatar>
            {drawerOpen && (
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  {user.fullName}
                </Typography>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}
                >
                  {user.roleName}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: `calc(100% - ${currentWidth}px)`,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#0a0f1e',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(148, 163, 184, 0.2)',
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: 'rgba(148, 163, 184, 0.4)',
            },
          },
        }}
      >
        <Outlet />
      </Box>
      <AiCopilot />
    </Box>
  )
}
