import {
  format,
  parseISO,
  formatDistanceToNow,
  differenceInSeconds,
  differenceInMinutes,
} from 'date-fns'
import { Priority, SlaStatus, SLA_TARGETS_HOURS } from '@/types/index'

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  try {
    return format(parseISO(isoString), 'MMM dd, yyyy HH:mm')
  } catch (error) {
    return '—'
  }
}

export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  try {
    return format(parseISO(isoString), 'MMM dd, yyyy')
  } catch (error) {
    return '—'
  }
}

export function formatRelative(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true })
  } catch (error) {
    return '—'
  }
}

export function getSlaPercentConsumed(
  createdAt: string,
  slaDueAt: string,
  priority: Priority
): number {
  try {
    const totalMinutes = (SLA_TARGETS_HOURS[priority] || 24) * 60
    const consumed = differenceInMinutes(new Date(), parseISO(createdAt))
    return Math.max(0, Math.min(Math.round((consumed / totalMinutes) * 100), 100))
  } catch (e) {
    return 0
  }
}

export function formatSlaCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'BREACHED'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  const hh = String(h).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')

  return `${hh}:${mm}:${ss}`
}

export function getSlaColor(slaStatus: SlaStatus): string {
  switch (slaStatus) {
    case 'BREACHED':
      return '#ef4444'
    case 'AT_RISK':
      return '#f59e0b'
    case 'ON_TRACK':
    default:
      return '#10b981'
  }
}

export function getSlaBackground(slaStatus: SlaStatus): string {
  switch (slaStatus) {
    case 'BREACHED':
      return 'rgba(239,68,68,0.12)'
    case 'AT_RISK':
      return 'rgba(245,158,11,0.12)'
    case 'ON_TRACK':
    default:
      return 'rgba(16,185,129,0.12)'
  }
}

export function calculatePriorityPreview(impact: string, urgency: string): Priority {
  const matrix: Record<string, Priority> = {
    HIGH_HIGH: 'P1',
    HIGH_MEDIUM: 'P2',
    HIGH_LOW: 'P3',
    MEDIUM_HIGH: 'P2',
    MEDIUM_MEDIUM: 'P3',
    MEDIUM_LOW: 'P4',
    LOW_HIGH: 'P3',
    LOW_MEDIUM: 'P4',
    LOW_LOW: 'P4',
  }
  return matrix[`${impact}_${urgency}`] ?? 'P4'
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const h = Math.floor(minutes / 60)
  const rem = minutes % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function isManagerOrAdmin(role: string): boolean {
  return role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER'
}
