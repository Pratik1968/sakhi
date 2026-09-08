import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MapCanvas } from '@/components/app/MapCanvas';
import { MapPin } from '@/components/app/MapPin';
import { MapPinMarker } from '@/components/app/MapPinMarker';
import { Badge } from '@/components/core/Badge';
import { Button } from '@/components/core/Button';
import { IconButton } from '@/components/core/IconButton';
import { StatusPill } from '@/components/core/StatusPill';
import { usePingLocation } from '@/hooks/queries';
import { geo, pins } from '@/data/sakhi';
import { colors, figtree } from '@/theme/tokens';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const ping = usePingLocation();

  // Push live location to the backend so active guardians receive it (native only).
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let sub: Location.LocationSubscription | undefined;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 8000, distanceInterval: 25 },
        (pos) => ping.mutate({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy ?? undefined }),
      );
    })();
    return () => sub?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.screen}>
      <RealMap />

      <View pointerEvents="box-none" style={[styles.topRow, { top: insets.top + 14 }]}>
        <StatusPill tone="safe" label="Live tracking" meta="8s ago" filled />
        <View style={styles.topBtns}>
          <IconButton icon="layers" variant="glass" size="sm" />
          <IconButton icon="share" variant="glass" size="sm" />
        </View>
      </View>

      <View style={[styles.sheet, { bottom: 16 }]}>
        <View style={styles.sheetHead}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Walking home</Text>
            <Text style={styles.sub}>100 Ft Road → Ashok Nagar · 1.4 km left</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.etaLabel}>ETA</Text>
            <Text style={styles.eta}>21:50</Text>
          </View>
        </View>
        <View style={styles.geofence}>
          <Text style={styles.geoLabel}>Geofence:</Text>
          <Badge tone="safe">In safe zone</Badge>
          <Badge tone="neutral">3 guardians</Badge>
        </View>
        <View style={styles.actions}>
          <View style={styles.btn}>
            <Button variant="primary" icon="share" fullWidth>
              Share link
            </Button>
          </View>
          <View style={styles.btn}>
            <Button variant="secondary" icon="route" fullWidth onPress={() => router.navigate('/routes')}>
              Safer route
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}

function RealMap() {
  // react-native-maps has no real web support; render the stylized canvas there.
  if (Platform.OS === 'web') {
    return (
      <MapCanvas zone route style={styles.fill}>
        {pins.map.map((p) => (
          <MapPin key={p.name} {...p} />
        ))}
      </MapCanvas>
    );
  }

  // Lazy-require so react-native-maps never enters the web bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: MapView, Marker, Polyline, Circle } = require('react-native-maps');

  return (
    // Default provider = Apple Maps on iOS (no API key), Google Maps on Android.
    <MapView style={styles.fill} initialRegion={geo.region} showsUserLocation showsCompass={false}>
      <Circle
        center={geo.safeZone.center}
        radius={geo.safeZone.radius}
        strokeColor={colors.coral400}
        fillColor="rgba(255,74,60,0.14)"
        strokeWidth={2}
      />
      <Polyline coordinates={geo.route} strokeColor={colors.coral500} strokeWidth={5} />
      {geo.markers.map((m) => (
        <Marker
          key={m.id}
          coordinate={{ latitude: m.latitude, longitude: m.longitude }}
          anchor={{ x: 0.5, y: 1 }}
        >
          <MapPinMarker name={m.name} tone={m.tone} size={m.id === 'you' ? 56 : 42} label={m.label} />
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mapBase },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  topRow: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topBtns: { flexDirection: 'row', gap: 8 },
  sheet: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 18,
    gap: 14,
    zIndex: 10,
    shadowColor: '#121114',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontFamily: figtree(800), fontSize: 21, letterSpacing: -0.024 * 21, color: colors.ink900 },
  sub: { fontFamily: figtree(400), fontSize: 14, color: colors.ink500, marginTop: 2 },
  etaLabel: { fontFamily: figtree(700), fontSize: 13, letterSpacing: 1.17, color: colors.ink500 },
  eta: { fontFamily: 'IBMPlexMono_600SemiBold', fontSize: 18, color: colors.ink900 },
  geofence: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  geoLabel: { fontFamily: figtree(400), fontSize: 14, color: colors.ink500 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1 },
});
