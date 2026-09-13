export type GuardianStatus = 'PENDING' | 'ACTIVE' | 'SOS_ONLY' | 'DECLINED';

export type Guardian = {
  id: string;
  ownerId: string;
  guardianUserId: string | null;
  inviteeContact: string | null;
  name: string;
  relationship: string | null;
  status: GuardianStatus;
  watchMode?: string;
  createdAt: string;
  guardian?: { id: string; name: string; email: string } | null;
  // Present on `watching` rows (links where I'm the guardian).
  owner?: { id: string; name: string; email: string } | null;
};

export type LocationPing = {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  recordedAt: string;
};

export type SosEvent = {
  id: string;
  userId: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  lat: number | null;
  lng: number | null;
  note: string | null;
  startedAt: string;
  resolvedAt: string | null;
  user?: { id: string; name: string };
};

export type Evidence = {
  id: string;
  kind: string; // AUDIO | VIDEO | IMAGE
  url: string;
  createdAt: string;
};

export type Incident = {
  id: string;
  userId: string;
  type: string;
  area: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  evidence?: Evidence[];
};

// ---- Safe routes ----
export type LatLng = { lat: number; lng: number };

// A single OSRM alternative scored by crime-news exposure. `coords` is a list of
// [lat, lon] pairs (the polyline). Lower `exposure` = safer.
export type PlannedRoute = {
  coords: [number, number][];
  length_m: number;
  duration_s: number;
  exposure: number;
  // 'safest' | 'altN' | 'altN+shortest'
  kind: string;
};

export type RouteIncident = { lat: number; lon: number; sev: number; type: string };

export type GeocodeResult = { name: string; lat: number; lng: number };

// A geocoded crime-news incident for the risk-zones map (GET /routes/incidents).
export type CrimeIncident = {
  id: string;
  crimeType: string;
  locality: string;
  severity: number;
  timeOfDay: string;
  lat: number;
  lon: number;
  incidentDate: string | null;
};

// Anonymized nearby incident others reported (GET /incidents/nearby).
export type NearbyIncident = {
  id: string;
  type: string;
  lat: number;
  lng: number;
  createdAt: string;
};

// A nearby-help place (GET /places/nearby), with distance from the query point.
export type Place = {
  id: string;
  category: string;
  name: string;
  address: string | null;
  phone: string | null;
  lat: number;
  lng: number;
  distanceM: number;
};

export type RoutePlanResponse = {
  src: [number, number];
  dst: [number, number];
  time: 'day' | 'night';
  engine: string;
  routes: PlannedRoute[];
  incidents: RouteIncident[];
};
