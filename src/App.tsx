import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SnackbarProvider } from 'notistack'

// Layouts & Guard
import AppLayout from '@/components/common/AppLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'

// Pages
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import IncidentListPage from '@/pages/IncidentListPage'
import IncidentDetailPage from '@/pages/IncidentDetailPage'
import CreateIncidentPage from '@/pages/CreateIncidentPage'
import ChangeListPage from '@/pages/ChangeListPage'
import ChangeDetailPage from '@/pages/ChangeDetailPage'
import CreateChangePage from '@/pages/CreateChangePage'
import ApprovalsPage from '@/pages/ApprovalsPage'
import UserManagementPage from '@/pages/UserManagementPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

// MUI Dark Theme Setup
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#06b6d4',
    },
    background: {
      default: '#0a0f1e',
      paper: '#111827',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})

// Query Client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={3000}
        >
          <BrowserRouter>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Shell */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                
                {/* Incidents management */}
                <Route path="incidents" element={<IncidentListPage />} />
                <Route path="incidents/new" element={<CreateIncidentPage />} />
                <Route path="incidents/:id" element={<IncidentDetailPage />} />
                
                {/* Changes management */}
                <Route path="changes" element={<ChangeListPage />} />
                <Route path="changes/new" element={<CreateChangePage />} />
                <Route path="changes/:id" element={<ChangeDetailPage />} />
                
                {/* Approvals (restricted in sidebar, double guard here if needed) */}
                <Route path="approvals" element={<ApprovalsPage />} />
                
                {/* Admin user management */}
                <Route
                  path="admin/users"
                  element={
                    <ProtectedRoute requiredRole="ROLE_ADMIN">
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Profile */}
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Catch-all fallback redirects to dashboard if authenticated, or login page handles redirect */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
