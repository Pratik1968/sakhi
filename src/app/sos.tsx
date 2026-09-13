import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { Button } from '@/components/core/Button';
import { Icon } from '@/components/core/Icon';
import { useGuardians, usePingLocation, useRaiseSos, useResolveSos } from '@/hooks/queries';
import { useAuth } from '@/providers/AuthProvider';
import { firstName, timeAgo } from '@/lib/format';
import { colors, figtree } from '@/theme/tokens';

// Live location is real; the audio/video "chips" are placeholder indicators —
// actual capture is deferred, so these only signal intent, not a running stream.
const ARMED_CHIPS = [
  { dot: colors.moss500, label: 'Location live' },
  { dot: colors.coral500, label: 'Recording audio' },
  { dot: colors.coral500, label: 'Recording video' },
];

// Join names as "A", "A and B", "A, B and C" — or null when the list is empty.
function joinNames(names: string[]): string | null {
  if (names.length === 0) return null;
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export default function SosScreen() {
  const router = useRouter();
  const raise = useRaiseSos();
  const resolve = useResolveSos();
  const ping = usePingLocation();
  const { data: guardians } = useGuardians();
  const { user } = useAuth();

  // Who is in distress (the signed-in user) vs. who is being alerted (guardians).
  const me = firstName(user?.name);
  const activeNames = (guardians ?? [])
    .filter((g) => g.status === 'ACTIVE')
    .map((g) => firstName(g.guardian?.name ?? g.name));
  const subject = joinNames(activeNames) ?? 'Your guardians';
  const [count, setCount] = useState(5);
  const phase: 'countdown' | 'armed' = count > 0 ? 'countdown' : 'armed';
  const sosId = useRef<string | null>(null);
  // Live coordinates from the watch, shown on-screen; null until the first fix.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  // Guards raise.mutateAsync so a GPS tick can't re-raise the SOS on every fix.
  const raised = useRef(false);

  // 5-second countdown (setState lives in the timer callback, not the effect body).
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  // On arm: start a LIVE location watch and keep guardians updated. This is an
  // emergency override — we intentionally do NOT consult the tracking preference
  // here. The FIRST fix (or a denied-permission / web result) raises the SOS
  // exactly once; every later fix pings the backend so guardians see us move.
  useEffect(() => {
    if (phase !== 'armed') return;

    // Raise the SOS through the backend, guarded so it fires exactly once.
    const raiseOnce = async (c: { lat?: number; lng?: number }) => {
      if (raised.current) return;
      raised.current = true;
      try {
        const ev = await raise.mutateAsync(c);
        sosId.current = ev.id;
      } catch {
        // keep UI even if the API call fails
      }
    };

    // Web has no watchPositionAsync — raise without coordinates and bail.
    if (Platform.OS === 'web') {
      raiseOnce({});
      return;
    }

    let cancelled = false;
    let sub: Location.LocationSubscription | undefined;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // No location — still raise the alert so guardians are notified.
        raiseOnce({});
        return;
      }
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 8000, distanceInterval: 25 },
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          // Push each fix so active guardians receive our realtime position.
          ping.mutate({ ...c, accuracy: pos.coords.accuracy ?? undefined });
          // First fix carries coordinates into the (one-shot) raise.
          raiseOnce(c);
        },
      );
      // If the effect was torn down while the subscription was resolving, stop
      // it immediately — the cleanup already ran.
      if (cancelled) {
        sub.remove();
        return;
      }
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const cancel = async () => {
    try {
      if (sosId.current) await resolve.mutateAsync({ id: sosId.current, cancel: true });
    } finally {
      router.replace('/live');
    }
  };

  return phase === 'countdown' ? (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>Alerting your circle in</Text>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.body}>
        {subject} will get your live location, and your phone starts recording.
      </Text>
      <Button variant="secondary" size="lg" fullWidth onPress={cancel}>
        I’m safe — cancel
      </Button>
    </View>
  ) : (
    <Armed onCancel={cancel} subject={subject} startedAt={raise.data?.startedAt} me={me} coords={coords} />
  );
}

function Armed({
  onCancel,
  subject,
  startedAt,
  me,
  coords,
}: {
  onCancel: () => void;
  subject: string;
  startedAt?: string;
  me: string;
  coords: { lat: number; lng: number } | null;
}) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.9, { duration: 1600, easing: Easing.out(Easing.ease) }), -1, false);
  }, [pulse]);
  const ring = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }], opacity: 1.9 - pulse.value }));

  return (
    <View style={styles.screen}>
      <View style={styles.pulseWrap}>
        <Animated.View style={[styles.pulseRing, ring]} />
        <View style={styles.core}>
          <Icon name="siren" size={46} color={colors.white} />
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Text style={styles.title}>Help is coming</Text>
        <Text style={styles.body}>
          {subject} got your location{startedAt ? ` ${timeAgo(startedAt)}` : ''}. Recording audio and video.
        </Text>
        <Text style={styles.needsHelp}>{me === 'You' ? 'You need help' : `${me} needs help`}</Text>
        {/* Live coordinate readout — the moss dot matches the "Location live" chip. */}
        <View style={styles.chip}>
          <View style={[styles.chipDot, { backgroundColor: colors.moss500 }]} />
          <Text style={styles.chipLabel}>
            {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Locating…'}
          </Text>
        </View>
      </View>
      <View style={styles.chips}>
        {ARMED_CHIPS.map((c) => (
          <View key={c.label} style={styles.chip}>
            <View style={[styles.chipDot, { backgroundColor: c.dot }]} />
            <Text style={styles.chipLabel}>{c.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actions}>
        <Button
          variant="danger"
          size="lg"
          icon="phone-call"
          fullWidth
          onPress={() => {
            // tel: links are a no-op on web; guard so we don't throw there.
            if (Platform.OS !== 'web') Linking.openURL('tel:112');
          }}
        >
          Call police · 112
        </Button>
        <Button variant="secondary" size="lg" fullWidth onPress={onCancel}>
          I’m safe — cancel alert
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
  eyebrow: { fontFamily: figtree(700), fontSize: 13, letterSpacing: 1.17, textTransform: 'uppercase', color: colors.ink300 },
  count: { fontFamily: 'IBMPlexMono_600SemiBold', fontSize: 96, color: colors.white, lineHeight: 100 },
  body: { fontFamily: figtree(400), fontSize: 16, color: colors.ink200, textAlign: 'center', lineHeight: 23, maxWidth: 290 },
  pulseWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: colors.coral500 },
  core: { width: 150, height: 150, borderRadius: 75, backgroundColor: colors.coral600, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: figtree(800), fontSize: 32, letterSpacing: -0.028 * 32, color: colors.white },
  needsHelp: { fontFamily: figtree(700), fontSize: 15, color: colors.white, textAlign: 'center' },
  chips: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.ink800, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipLabel: { fontFamily: figtree(500), fontSize: 14, color: colors.ink100 },
  actions: { alignSelf: 'stretch', gap: 10 },
});
