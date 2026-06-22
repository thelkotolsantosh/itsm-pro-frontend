import { apiClient } from './client'
import {
  AuthResponse,
  IncidentResponse,
  ChangeRequestResponse,
  PagedResponse,
  DashboardData,
  UserSummary,
  GroupSummary,
} from '@/types/index'

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { username, password }),
  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }),
  logout: () =>
    apiClient.post<void>('/auth/logout'),
}

export const incidentApi = {
  getAll: (params: {
    status?: string
    priority?: string
    search?: string
    page?: number
    size?: number
    sort?: string
  }) =>
    apiClient.get<PagedResponse<IncidentResponse>>('/incidents', { params }),
  getById: (id: number) =>
    apiClient.get<IncidentResponse>(`/incidents/${id}`),
  getByTicketNumber: (ticketNumber: string) =>
    apiClient.get<IncidentResponse>(`/incidents/number/${ticketNumber}`),
  create: (data: {
    title: string
    description: string
    category?: string
    subcategory?: string
    impact: string
    urgency: string
    assignmentGroupId?: number | null
  }) =>
    apiClient.post<IncidentResponse>('/incidents', data),
  update: (id: number, data: Partial<IncidentResponse>) =>
    apiClient.put<IncidentResponse>(`/incidents/${id}`, data),
  updateStatus: (id: number, newStatus: string, resolutionNotes?: string) =>
    apiClient.patch<IncidentResponse>(`/incidents/${id}/status`, null, {
      params: { newStatus, resolutionNotes },
    }),
  assign: (id: number, assigneeId?: number | null, groupId?: number | null) =>
    apiClient.patch<IncidentResponse>(`/incidents/${id}/assign`, null, {
      params: { assigneeId, groupId },
    }),
  cancel: (id: number) =>
    apiClient.delete<void>(`/incidents/${id}`),
}

export const changeApi = {
  getAll: (params: {
    status?: string
    search?: string
    page?: number
    size?: number
  }) =>
    apiClient.get<PagedResponse<ChangeRequestResponse>>('/changes', { params }),
  getById: (id: number) =>
    apiClient.get<ChangeRequestResponse>(`/changes/${id}`),
  getPendingApproval: (params: { page?: number; size?: number }) =>
    apiClient.get<PagedResponse<ChangeRequestResponse>>('/changes/pending-approval', { params }),
  create: (data: {
    title: string
    description: string
    changeType: string
    riskLevel: string
    implementationPlan?: string
    rollbackPlan?: string
    testPlan?: string
    scheduledStart?: string
    scheduledEnd?: string
  }) =>
    apiClient.post<ChangeRequestResponse>('/changes', data),
  submitForReview: (id: number) =>
    apiClient.post<ChangeRequestResponse>(`/changes/${id}/submit`),
  approve: (id: number, decision: string, comments?: string) =>
    apiClient.post<ChangeRequestResponse>(`/changes/${id}/approve`, { decision, comments }),
  updateStatus: (id: number, newStatus: string) =>
    apiClient.patch<ChangeRequestResponse>(`/changes/${id}/status`, null, {
      params: { newStatus },
    }),
}

export const dashboardApi = {
  getData: (period: number = 30) =>
    apiClient.get<DashboardData>('/dashboard', { params: { period } }),
}

export const userApi = {
  getAll: (params: { page?: number; size?: number }) =>
    apiClient.get<PagedResponse<UserSummary>>('/admin/users', { params }),
  create: (data: {
    fullName: string
    username: string
    email: string
    password?: string
    department?: string
    phone?: string
    roleName: string
    team?: string
    shift?: string
    status?: string
  }) =>
    apiClient.post<UserSummary>('/admin/users', data),
  update: (
    id: number,
    data: {
      fullName: string
      email: string
      department: string
      phone?: string
      roleName?: string
      team?: string
      shift?: string
      status?: string
      password?: string
    }
  ) =>
    apiClient.put<UserSummary>(`/admin/users/${id}`, data),
  delete: (id: number) =>
    apiClient.delete<void>(`/admin/users/${id}`),
}

export const groupApi = {
  getAll: () =>
    apiClient.get<GroupSummary[]>('/groups'),
}

export const aiApi = {
  predictSla: (incidentId: number) =>
    apiClient.get<{
      incidentId: number
      breachRisk: number
      confidence: number
      factors: string[]
      recommendations: string[]
    }>(`/ai/predict-sla/${incidentId}`),
  generateRca: (incidentId: number) =>
    apiClient.get<{
      incidentId: number
      confidence: number
      rootCause: string
      evidence: string[]
      fixes: string[]
    }>(`/ai/generate-rca/${incidentId}`),
}
