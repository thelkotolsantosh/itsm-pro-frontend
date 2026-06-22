import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import {
  dashboardApi,
  incidentApi,
  changeApi,
  groupApi,
} from '@/api/services'

export function useDashboard(period = 30) {
  return useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardApi.getData(period).then((res) => res.data),
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

export function useIncidents(params: {
  status?: string
  priority?: string
  search?: string
  page?: number
  size?: number
  sort?: string
}) {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => incidentApi.getAll(params).then((res) => res.data),
    staleTime: 15000,
  })
}

export function useIncident(id: number) {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentApi.getById(id).then((res) => res.data),
    enabled: !!id,
    refetchInterval: 30000,
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (data: Parameters<typeof incidentApi.create>[0]) =>
      incidentApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      enqueueSnackbar('Incident created successfully', { variant: 'success' })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create incident'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })
}

export function useUpdateIncidentStatus(incidentId: number) {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (data: { newStatus: string; resolutionNotes?: string }) =>
      incidentApi.updateStatus(incidentId, data.newStatus, data.resolutionNotes).then((res) => res.data),
    onSuccess: (updatedIncident) => {
      queryClient.setQueryData(['incident', incidentId], updatedIncident)
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      enqueueSnackbar(`Incident status updated to ${updatedIncident.status}`, { variant: 'success' })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update status'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })
}

export function useAssignIncident(incidentId: number) {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (data: { assigneeId?: number | null; groupId?: number | null }) =>
      incidentApi.assign(incidentId, data.assigneeId, data.groupId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] })
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      enqueueSnackbar('Incident assignment updated', { variant: 'success' })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to assign incident'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })
}

export function useChanges(params: {
  status?: string
  search?: string
  page?: number
  size?: number
}) {
  return useQuery({
    queryKey: ['changes', params],
    queryFn: () => changeApi.getAll(params).then((res) => res.data),
    staleTime: 15000,
  })
}

export function useChange(id: number) {
  return useQuery({
    queryKey: ['change', id],
    queryFn: () => changeApi.getById(id).then((res) => res.data),
    enabled: !!id,
  })
}

export function usePendingApprovals(params = {}) {
  return useQuery({
    queryKey: ['pending-approvals', params],
    queryFn: () => changeApi.getPendingApproval(params).then((res) => res.data),
    refetchInterval: 30000,
  })
}

export function useSubmitChange(changeId: number) {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: () => changeApi.submitForReview(changeId).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change', changeId] })
      queryClient.invalidateQueries({ queryKey: ['changes'] })
      enqueueSnackbar('Change request submitted for review', { variant: 'success' })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to submit change request'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })
}

export function useRecordApproval(changeId: number) {
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  return useMutation({
    mutationFn: (data: { decision: string; comments?: string }) =>
      changeApi.approve(changeId, data.decision, data.comments).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change', changeId] })
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      enqueueSnackbar('Approval decision recorded', { variant: 'success' })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to record decision'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupApi.getAll().then((res) => res.data),
    staleTime: 300000,
  })
}
