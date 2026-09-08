import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Guardian, Incident, LocationPing, SosEvent } from '@/lib/types';

// ---- Guardians ----
export function useGuardians() {
  return useQuery({ queryKey: ['guardians'], queryFn: () => api.get<Guardian[]>('/guardians') });
}

export function useInviteGuardian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; contact: string; watchMode?: 'ACTIVE' | 'SOS_ONLY' }) =>
      api.post<Guardian>('/guardians', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guardians'] }),
  });
}

// ---- SOS ----
export function useMySos() {
  return useQuery({ queryKey: ['sos', 'mine'], queryFn: () => api.get<SosEvent[]>('/sos') });
}

export function useSosFeed() {
  return useQuery({ queryKey: ['sos', 'feed'], queryFn: () => api.get<SosEvent[]>('/sos/feed') });
}

export function useRaiseSos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { lat?: number; lng?: number; note?: string }) =>
      api.post<SosEvent>('/sos', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sos'] }),
  });
}

export function useResolveSos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; cancel?: boolean }) =>
      api.post<SosEvent>(`/sos/${input.id}/${input.cancel ? 'cancel' : 'resolve'}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sos'] }),
  });
}

// ---- Location ----
export function useLatestLocation(userId: string = 'me') {
  return useQuery({
    queryKey: ['location', userId],
    queryFn: () => api.get<LocationPing | null>(`/location/${userId}/latest`),
  });
}

export function usePingLocation() {
  return useMutation({
    mutationFn: (input: { lat: number; lng: number; accuracy?: number }) =>
      api.post<LocationPing>('/location', input),
  });
}

// ---- Evidence ----
export type Evidence = { id: string; kind: string; url: string; createdAt: string };

export function useEvidence() {
  return useQuery({ queryKey: ['evidence'], queryFn: () => api.get<Evidence[]>('/evidence') });
}

export function useUploadEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      file: { uri: string; name: string; type: string };
      kind?: string;
      sosEventId?: string;
      incidentId?: string;
    }) => {
      const fields: Record<string, string> = {};
      if (input.kind) fields.kind = input.kind;
      if (input.sosEventId) fields.sosEventId = input.sosEventId;
      if (input.incidentId) fields.incidentId = input.incidentId;
      return api.upload<Evidence>('/evidence', input.file, fields);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evidence'] }),
  });
}

// ---- Incidents ----
export function useIncidents() {
  return useQuery({ queryKey: ['incidents'], queryFn: () => api.get<Incident[]>('/incidents') });
}

export function useReportIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: string; note?: string; lat?: number; lng?: number }) =>
      api.post<Incident>('/incidents', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
  });
}
