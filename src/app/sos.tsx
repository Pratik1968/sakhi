import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { Button } from '@/components/core/Button';
import { Icon } from '@/components/core/Icon';
import { useRaiseSos, useResolveSos } from '@/hooks/queries';
import { armedChips } from '@/data/sakhi';
import { colors, figtree } from '@/theme/tokens';

export default function SosScreen() {
  const router = useRouter();
  const raise = useRaiseSos();
  const resolve = useResolveSos();
  const [count, setCount] = useState(5);
  const phase: 'countdown' | 'armed' = count > 0 ? 'countdown' : 'armed';
  const sosId = useRef<string | null>(null);

  // 5-second countdown (setState lives in the timer callback, not the effect body).
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  // On arm: raise the SOS through the backend with the current location.
  useEffect(() => {
    if (phase !== 'armed') return;
    (async () => {
      let coords: { lat?: number; lng?: number } = {};
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        }
      } catch {
        // location optional
      }
      try {
        const ev = await raise.mutateAsync(coords);
        sosId.current = ev.id;
      } catch {
        // keep UI even if the API call fails
      }
    })();
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
        Priya, Nikhil and Divya will get your live location, and your phone starts recording.
      </Text>
      <Button variant="secondary" size="lg" fullWidth onPress={cancel}>
        I’m safe — cancel
      </Button>
    </View>
  ) : (
    <Armed onCancel={cancel} />
  );
}

function Armed({ onCancel }: { onCancel: () => void }) {
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
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.title}>Help is coming</Text>
        <Text style={styles.body}>
          Priya and Nikhil got your location 8 seconds ago. Recording audio and video.
        </Text>
      </View>
      <View style={styles.chips}>
        {armedChips.map((c) => (
          <View key={c.label} style={styles.chip}>
            <View style={[styles.chipDot, { backgroundColor: c.dot }]} />
            <Text style={styles.chipLabel}>{c.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.actions}>
        <Button variant="danger" size="lg" icon="phone-call" fullWidth>
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
  chips: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.ink800, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 14 },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipLabel: { fontFamily: figtree(500), fontSize: 14, color: colors.ink100 },
  actions: { alignSelf: 'stretch', gap: 10 },
});
