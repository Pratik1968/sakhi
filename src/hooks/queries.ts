import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  CrimeIncident,
  Evidence,
  GeocodeResult,
  Guardian,
  Incident,
  LatLng,
  LocationPing,
  NearbyIncident,
  Place,
  RoutePlanResponse,
  SosEvent,
} from '@/lib/types';

// Re-exported so existing importers (e.g. the Evidence screen) keep working.
export type { Evidence };

// ---- Guardians ----
export function useGuardians() {
  return useQuery({
    queryKey: ['guardians'],
    queryFn: () => api.get<Guardian[]>('/guardians'),
    refetchInterval: 15000,
  });
}

export function useInviteGuardian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      contact: string;
      relationship?: string;
      watchMode?: 'ACTIVE' | 'SOS_ONLY';
    }) => api.post<Guardian>('/guardians', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guardians'] }),
  });
}

// Links where the current user is the guardian (invites to watch over others).
// Polled so pending requests surface without relying on push (simulators can't
// register a push token).
export function useWatching() {
  return useQuery({
    queryKey: ['watching'],
    queryFn: () => api.get<Guardian[]>('/guardians/watching'),
    refetchInterval: 15000,
  });
}

// Accept or decline a guardian invite. Invalidates both the owner's circle and
// the watching list so the UI reflects the reciprocal link immediately.
export function useRespondInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      api.post(`/guardians/${id}/${accept ? 'accept' : 'decline'}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guardians'] });
      qc.invalidateQueries({ queryKey: ['watching'] });
      qc.invalidateQueries({ queryKey: ['guardian-lookup'] });
    },
  });
}

// Does this email/phone already belong to a Sakhi user? Drives the add-guardian
// confirm modal's "already on Sakhi" vs "invite pending" banner. Enabled only
// once a contact of at least 3 chars is present.
export function useContactLookup(contact: string) {
  return useQuery({
    queryKey: ['guardian-lookup', contact.trim()],
    queryFn: () =>
      api.get<{ exists: boolean; name: string | null }>(
        `/guardians/lookup?contact=${encodeURIComponent(contact.trim())}`,
      ),
    enabled: contact.trim().length >= 3,
    staleTime: 60 * 1000,
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

// Latest location for each of several users (the owner's active guardians), so
// the map can plot their live pins alongside "You". Polls every 15s and reuses
// the same query key as useLatestLocation. Returns only entries that have a
// known location — no placeholder pins.
export function useGuardianLocations(userIds: string[]) {
  return useQueries({
    queries: userIds.map((id) => ({
      queryKey: ['location', id],
      queryFn: () => api.get<LocationPing | null>(`/location/${id}/latest`),
      refetchInterval: 15000,
    })),
    combine: (results) =>
      userIds
        .map((userId, i) => ({ userId, location: results[i].data ?? null }))
        .filter((x): x is { userId: string; location: LocationPing } => !!x.location),
  });
}

// ---- Evidence ----
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
    mutationFn: (input: {
      type: string;
      area?: string;
      description?: string;
      lat?: number;
      lng?: number;
    }) => api.post<Incident>('/incidents', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
  });
}

// Anonymized recent incidents near the user (all users), for "others near you".
export function useNearbyIncidents() {
  return useQuery({
    queryKey: ['incidents', 'nearby'],
    queryFn: () => api.get<NearbyIncident[]>('/incidents/nearby'),
  });
}

// ---- Risk zones (crime incidents) ----
export function useCrimeIncidents() {
  return useQuery({
    queryKey: ['crime-incidents'],
    queryFn: () => api.get<CrimeIncident[]>('/routes/incidents'),
    staleTime: 15 * 60 * 1000,
  });
}

// ---- Nearby help (police / hospitals / support) ----
// Distance-sorted places near `coords` for the selected category. Gated on
// coords so it doesn't fire before a location is resolved.
export function useNearbyPlaces(
  coords: { lat: number; lng: number } | null,
  category: string,
) {
  return useQuery({
    queryKey: ['places', category, coords?.lat, coords?.lng],
    queryFn: () =>
      api.get<Place[]>(
        `/places/nearby?lat=${coords!.lat}&lng=${coords!.lng}&category=${category}`,
      ),
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
  });
}

// ---- Ask Sakhi (Gemini-backed safety / first-aid / legal assistant) ----
export function useAskSakhi() {
  return useMutation({
    mutationFn: (input: { message: string; history?: { from: string; text: string }[] }) =>
      api.post<{ reply: string }>('/chat/ask', input),
  });
}

// ---- Safe routes ----
export function usePlanRoute() {
  return useMutation({
    mutationFn: (input: { from: LatLng; to: LatLng; time?: 'day' | 'night' }) =>
      api.post<RoutePlanResponse>('/routes/plan', input),
  });
}

// Forward-geocode a typed destination. Enabled only for queries ≥ 3 chars;
// debounce the input in the component before passing it here.
export function useGeocode(query: string) {
  return useQuery({
    queryKey: ['geocode', query],
    queryFn: () => api.get<GeocodeResult[]>(`/routes/geocode?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length >= 3,
    staleTime: 5 * 60 * 1000,
  });
}
