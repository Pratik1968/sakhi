import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/providers/AuthProvider';

// Server payloads pushed to a guardian's private room.
type SosNew = {
  id: string;
  userId: string;
  name: string;
  lat: number | null;
  lng: number | null;
  note: string | null;
  startedAt: string;
};
type SosResolved = { id: string; userId: string; status: 'RESOLVED' | 'CANCELLED' };

/**
 * Guardian-side realtime SOS listener. Called once from RootNavigator so the
 * guardian's app reacts when a watched person raises an alert — push doesn't
 * work on simulators, so the socket drives the in-app full-screen alert.
 */
export function useSosRealtime(): void {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  // Remember which SOS ids we've already routed to, so a re-render or a
  // duplicate emit can't open the alert screen twice for the same event.
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    // onAuthed() creates the socket right after setUser, so by the time this
    // effect re-runs for a new user it exists; bail (and re-run) if it doesn't.
    const socket = getSocket();
    if (!socket) return;

    const onNew = (payload: SosNew) => {
      qc.invalidateQueries({ queryKey: ['sos', 'feed'] });
      if (seen.current.has(payload.id)) return;
      seen.current.add(payload.id);
      // expo-router params are strings — stringify coords, coalesce a null note.
      router.push({
        pathname: '/guardian-alert',
        params: {
          id: payload.id,
          userId: payload.userId,
          name: payload.name,
          lat: payload.lat == null ? '' : String(payload.lat),
          lng: payload.lng == null ? '' : String(payload.lng),
          note: payload.note ?? '',
          startedAt: payload.startedAt,
        },
      });
    };

    const onResolved = (_payload: SosResolved) => {
      // The alert screen auto-dismisses itself; here we just refresh the feed.
      qc.invalidateQueries({ queryKey: ['sos', 'feed'] });
    };

    socket.on('sos:new', onNew);
    socket.on('sos:resolved', onResolved);
    return () => {
      socket.off('sos:new', onNew);
      socket.off('sos:resolved', onResolved);
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
}
