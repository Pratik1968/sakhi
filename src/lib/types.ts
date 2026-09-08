export type GuardianStatus = 'PENDING' | 'ACTIVE' | 'SOS_ONLY' | 'DECLINED';

export type Guardian = {
  id: string;
  ownerId: string;
  guardianUserId: string | null;
  inviteeContact: string | null;
  name: string;
  status: GuardianStatus;
  createdAt: string;
  guardian?: { id: string; name: string; email: string } | null;
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

export type Incident = {
  id: string;
  userId: string;
  type: string;
  note: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
};
