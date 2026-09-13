import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Button } from '@/components/core/Button';
import { Icon } from '@/components/core/Icon';
import { getSocket } from '@/lib/socket';
import { firstName, timeAgo } from '@/lib/format';
import { colors, figtree } from '@/theme/tokens';

// Realtime payloads relevant while the alert is open.
type LocationUpdate = { userId: string; name: string; lat: number; lng: number; accuracy: number | null; recordedAt: string };
type SosResolved = { id: string; userId: string; status: 'RESOLVED' | 'CANCELLED' };

// Parse a param float, returning null for missing/NaN values.
function parseCoord(v?: string): number | null {
  if (!v) return null;
  const n = Number.parseFloat(v);
  return Number.isNaN(n) ? null : n;
}

export default function GuardianAlertScreen() {
  const router = useRouter();
  const { id, userId, name, lat, lng, note, startedAt } = useLocalSearchParams<{
    id: string;
    userId: string;
    name: string;
    lat: string;
    lng: string;
    note: string;
    startedAt: string;
  }>();

  // Seed from the param coords; the socket keeps this fresh as they move.
  const seedLat = parseCoord(lat);
  const seedLng = parseCoord(lng);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    seedLat != null && seedLng != null ? { lat: seedLat, lng: seedLng } : null,
  );

  // Dismiss to the modal's parent, or the live tab if opened cold (deep link).
  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/live'));

  // Live updates for this specific person while the alert is open.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onLocation = (payload: LocationUpdate) => {
      if (payload.userId === userId) setCoords({ lat: payload.lat, lng: payload.lng });
    };
    const onResolved = (payload: SosResolved) => {
      if (payload.userId === userId || payload.id === id) dismiss();
    };

    socket.on('location:update', onLocation);
    socket.on('sos:resolved', onResolved);
    return () => {
      socket.off('location:update', onLocation);
      socket.off('sos:resolved', onResolved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, id]);

  // Pulsing siren core — matches the armed state on sos.tsx.
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.9, { duration: 1600, easing: Easing.out(Easing.ease) }), -1, false);
  }, [pulse]);
  const ring = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }], opacity: 1.9 - pulse.value }));

  const openMap = () => {
    // Apple Maps deep link; no-op on web or before the first fix.
    if (Platform.OS === 'web' || !coords) return;
    Linking.openURL(`http://maps.apple.com/?ll=${coords.lat},${coords.lng}&q=${encodeURIComponent(name ?? '')}`);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.pulseWrap}>
        <Animated.View style={[styles.pulseRing, ring]} />
        <View style={styles.core}>
          <Icon name="siren" size={46} color={colors.white} />
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Text style={styles.title}>{firstName(name)} needs help</Text>
        {startedAt ? <Text style={styles.body}>Started {timeAgo(startedAt)}</Text> : null}
        {/* Live coordinate readout — the moss dot matches the "Location live" chip. */}
        <View style={styles.chips}>
          <View style={styles.chip}>
            <View style={[styles.chipDot, { backgroundColor: colors.moss500 }]} />
            <Text style={styles.chipLabel}>
              {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Locating…'}
            </Text>
          </View>
          <View style={styles.chip}>
            <View style={[styles.chipDot, { backgroundColor: colors.moss500 }]} />
            <Text style={styles.chipLabel}>Location live</Text>
          </View>
        </View>
        {note ? <Text style={styles.note}>“{note}”</Text> : null}
      </View>
      <View style={styles.actions}>
        <Button variant="danger" size="lg" icon="navigation" fullWidth onPress={openMap}>
          View on map
        </Button>
        <Button variant="secondary" size="lg" fullWidth onPress={dismiss}>
          Dismiss
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink900,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 32,
  },
  body: { fontFamily: figtree(400), fontSize: 16, color: colors.ink200, textAlign: 'center', lineHeight: 23, maxWidth: 290 },
  note: { fontFamily: figtree(500), fontSize: 15, color: colors.ink100, textAlign: 'center', lineHeight: 22, maxWidth: 290 },
  pulseWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: colors.coral500 },
  core: { width: 150, height: 150, borderRadius: 75, backgroundColor: colors.coral600, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: figtree(800), fontSize: 32, letterSpacing: -0.028 * 32, color: colors.white, textAlign: 'center' },
  chips: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.ink800, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipLabel: { fontFamily: figtree(500), fontSize: 14, color: colors.ink100 },
  actions: { alignSelf: 'stretch', gap: 10 },
});
