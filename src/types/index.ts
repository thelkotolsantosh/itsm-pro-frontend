export type Priority = 'P1' | 'P2' | 'P3' | 'P4'
export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW'
export type UrgencyLevel = 'HIGH' | 'MEDIUM' | 'LOW'
export type IncidentStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED' | 'CANCELLED'
export type SlaStatus = 'ON_TRACK' | 'AT_RISK' | 'BREACHED'
export type ChangeType = 'STANDARD' | 'NORMAL' | 'EMERGENCY'
export type ChangeStatus = 'DRAFT' | 'SUBMITTED' | 'CAB_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'IMPLEMENTED' | 'FAILED' | 'CLOSED' | 'REJECTED'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED'
export type UserRole = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_USER'

export interface UserSummary {
  id: number
  username: string
  fullName: string
  email: string
  department: string
  phone?: string
  team?: string
  shift?: string
  status?: string
  role?: string
  createdAt?: string
}

export interface GroupSummary {
  id: number
  name: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: number
  username: string
  fullName: string
  email: string
  role: string
}

export interface IncidentResponse {
  id: number
  ticketNumber: string
  title: string
  description: string
  category: string
  subcategory: string
  impact: ImpactLevel
  urgency: UrgencyLevel
  priority: Priority
  status: IncidentStatus
  slaStatus: SlaStatus
  slaDueAt: string
  slaPaused: boolean
  slaMinutesRemaining: number
  resolutionNotes: string
  resolvedAt: string
  closedAt: string
  assignedTo: UserSummary | null
  assignmentGroup: GroupSummary | null
  createdBy: UserSummary
  createdAt: string
  updatedAt: string
}

export interface ApprovalSummary {
  id: number
  approver: UserSummary
  decision: ApprovalDecision
  comments: string
  stage: number
  decidedAt: string
}

export interface ChangeRequestResponse {
  id: number
  ticketNumber: string
  title: string
  description: string
  changeType: ChangeType
  status: ChangeStatus
  riskLevel: RiskLevel
  implementationPlan: string
  rollbackPlan: string
  testPlan: string
  scheduledStart: string
  scheduledEnd: string
  actualStart: string
  actualEnd: string
  createdBy: UserSummary
  assignedTo: UserSummary | null
  assignmentGroup: GroupSummary | null
  approvals: ApprovalSummary[]
  createdAt: string
  updatedAt: string
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface DashboardData {
  openIncidents: number
  p1OpenIncidents: number
  slaBreachedCount: number
  resolvedInPeriod: number
  slaComplianceRate: number
  mttrMinutes: number
  pendingChanges: number
  dailyVolume: Array<{ date: string; count: number }>
  incidentsByPriority: Array<{ priority: string; count: number }>
  incidentsByStatus: Array<{ status: string; count: number }>
  topCategories: Array<{ category: string; count: number }>
  slaComplianceTrend: Array<{ date: string; rate: number }>
  changeSummary: Record<string, number>
  periodDays: number
  generatedAt: string
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fieldErrors?: Record<string, string>
}

export const SLA_TARGETS_HOURS: Record<Priority, number> = {
  P1: 1, P2: 4, P3: 8, P4: 24
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  P1: 'P1 — Critical', P2: 'P2 — High', P3: 'P3 — Medium', P4: 'P4 — Low'
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  P1: '#ef4444', P2: '#f59e0b', P3: '#3b82f6', P4: '#10b981'
}

export const INCIDENT_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'PENDING', 'CANCELLED'],
  IN_PROGRESS: ['PENDING', 'RESOLVED', 'CANCELLED'],
  PENDING: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  CANCELLED: [],
}
