import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapCanvas } from '@/components/app/MapCanvas';
import { MapPin } from '@/components/app/MapPin';
import { SubHeader } from '@/components/app/SubHeader';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { pins, routes } from '@/data/sakhi';
import { colors, figtree } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function RoutesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [picked, setPicked] = useState('r2');

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Safe route" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Input label="GOING TO" icon="map-pin" value="Home · Ashok Nagar" />

        <MapCanvas route style={styles.map}>
          {pins.route.map((p) => (
            <MapPin key={p.name} {...p} />
          ))}
        </MapCanvas>

        <View style={{ gap: 12 }}>
          {routes.map((r) => {
            const active = r.id === picked;
            return (
              <Pressable
                key={r.id}
                onPress={() => setPicked(r.id)}
                style={[styles.route, cardShadow, active && styles.routeActive]}
              >
                <View style={styles.routeHead}>
                  <Text style={styles.routeName}>{r.name}</Text>
                  <Text style={styles.routeTime}>{r.time}</Text>
                </View>
                <View style={styles.barRow}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: r.pct, backgroundColor: r.barColor }]} />
                  </View>
                  <Text style={[styles.score, { color: r.barColor }]}>{r.score}</Text>
                </View>
                <Text style={styles.why}>{r.why}</Text>
              </Pressable>
            );
          })}
        </View>

        <Button variant="primary" size="lg" icon="navigation" fullWidth onPress={() => router.navigate('/map')}>
          Start journey with check-in
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 20 },
  map: { height: 160, borderRadius: 18, ...cardShadow },
  route: { backgroundColor: colors.white, borderRadius: 18, padding: 16, gap: 10, borderWidth: 2, borderColor: 'transparent' },
  routeActive: { borderColor: colors.ink900 },
  routeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routeName: { fontFamily: figtree(800), fontSize: 18, letterSpacing: -0.018 * 18, color: colors.ink900 },
  routeTime: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 15, color: colors.ink600 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barTrack: { flex: 1, height: 6, borderRadius: 99, backgroundColor: colors.ink100, overflow: 'hidden' },
  barFill: { height: '100%' },
  score: { fontFamily: figtree(700), fontSize: 13, letterSpacing: 1.17 },
  why: { fontFamily: figtree(400), fontSize: 13, color: colors.ink500, lineHeight: 18 },
});
