import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubHeader } from '@/components/app/SubHeader';
import { MetaText, TileView } from '@/components/app/rows';
import { ListRow } from '@/components/core/ListRow';
import { SegmentedControl } from '@/components/core/SegmentedControl';
import { useLatestLocation, useNearbyPlaces } from '@/hooks/queries';
import { nearbyOptions, type Tile } from '@/data/sakhi';
import { colors, figtree, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

// Hyderabad city centre — last-resort location if GPS and the last known ping
// are both unavailable (matches map.tsx).
const FALLBACK = { lat: 17.435, lng: 78.343 };

// Segmented tab label → API category.
const CATEGORY: Record<string, string> = {
  Police: 'police',
  Hospitals: 'hospital',
  Support: 'support',
};

// Leading tile per category (reusing the palette used elsewhere in the app).
const TILE: Record<string, Tile> = {
  police: { icon: 'shield-check', bg: '#FFF0EE', fg: '#B92C22' },
  hospital: { icon: 'heart', bg: '#EAF3EC', fg: '#3F7A4E' },
  support: { icon: 'users', bg: '#F1EEFB', fg: '#5B45B8' },
};

function fmtDist(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export default function NearbyScreen() {
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState('Police');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const { data: lastPing } = useLatestLocation('me');

  // Resolve the device location once (native only); fall back to the last known
  // ping, then Hyderabad centre, so the list always has a query point.
  const captureGps = useCallback(async () => {
    if (Platform.OS === 'web') return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
  }, []);

  useEffect(() => {
    captureGps().catch(() => {});
  }, [captureGps]);

  const coords = useMemo(
    () =>
      gps ??
      (lastPing ? { lat: lastPing.lat, lng: lastPing.lng } : null) ??
      FALLBACK,
    [gps, lastPing],
  );

  const category = CATEGORY[cat] ?? 'police';
  const { data, isLoading } = useNearbyPlaces(coords, category);

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Nearby help" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SegmentedControl options={nearbyOptions} value={cat} onChange={setCat} fullWidth />

        <View style={styles.card}>
          {isLoading ? (
            <ListRow chevron={false} divider={false} title="Finding places near you…" />
          ) : !data || data.length === 0 ? (
            <ListRow chevron={false} divider={false} title="No nearby places available yet." />
          ) : (
            data.map((p, i, arr) => (
              <ListRow
                key={p.id}
                divider={i < arr.length - 1}
                chevron={false}
                leading={<TileView tile={TILE[p.category] ?? TILE.police} />}
                title={p.name}
                subtitle={p.address ?? undefined}
                trailing={<MetaText>{fmtDist(p.distanceM)}</MetaText>}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 18 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingHorizontal: space.cardPadding,
    ...cardShadow,
  },
});
