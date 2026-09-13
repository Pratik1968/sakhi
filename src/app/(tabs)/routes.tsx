import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MapCanvas } from '@/components/app/MapCanvas';
import { SubHeader } from '@/components/app/SubHeader';
import { Button } from '@/components/core/Button';
import { Icon } from '@/components/core/Icon';
import { IconButton } from '@/components/core/IconButton';
import { Input } from '@/components/core/Input';
import { useGeocode, usePlanRoute } from '@/hooks/queries';
import { geo } from '@/data/sakhi';
import { PlannedRoute } from '@/lib/types';
import { colors, figtree } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

type LatLng = { lat: number; lng: number };

// Fallback coordinates (Hyderabad) so the screen is usable on web / before a GPS
// fix — the crime dataset + local OSRM graph both cover Hyderabad.
const FALLBACK_START: LatLng = { lat: 17.435, lng: 78.343 };

export default function RoutesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const plan = usePlanRoute();

  const isWeb = Platform.OS === 'web';
  const [time, setTime] = useState<'day' | 'night'>('night');
  const [start, setStart] = useState<LatLng | null>(isWeb ? FALLBACK_START : null);
  const [locating, setLocating] = useState(false);
  const [dest, setDest] = useState<LatLng | null>(null);
  const [destName, setDestName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  // Destination search: debounce the text before geocoding.
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [showResults, setShowResults] = useState(false);
  const geocode = useGeocode(debounced);

  const locate = useCallback(async () => {
    if (isWeb) {
      setStart(FALLBACK_START);
      return;
    }
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setStart(FALLBACK_START);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setStart({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } finally {
      setLocating(false);
    }
  }, [isWeb]);

  // Grab the current position as the journey start on mount. Inlined (rather
  // than calling locate()) so the first setState happens after an await — avoids
  // a synchronous setState in the effect body. Web already starts seeded.
  useEffect(() => {
    if (isWeb) return;
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setStart(FALLBACK_START);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!cancelled) setStart({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    })();
    return () => {
      cancelled = true;
    };
  }, [isWeb]);

  // Debounce the search box (350ms) before hitting the geocoder.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const routes = useMemo(() => plan.data?.routes ?? [], [plan.data]);
  const incidents = useMemo(() => plan.data?.incidents ?? [], [plan.data]);
  const shortest = useMemo(
    () => (routes.length ? routes.reduce((s, r) => (r.length_m < s.length_m ? r : s), routes[0]) : null),
    [routes],
  );
  const maxExposure = useMemo(() => Math.max(1, ...routes.map((r) => r.exposure)), [routes]);

  function pickResult(r: { name: string; lat: number; lng: number }) {
    setDest({ lat: r.lat, lng: r.lng });
    // Keep the first, most specific part of the OSM display name.
    const short = r.name.split(',').slice(0, 2).join(',');
    setDestName(short);
    setSearch(short);
    setShowResults(false);
  }

  function dropPin(c: LatLng) {
    setDest(c);
    setDestName(`Pin · ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`);
    setSearch('');
    setShowResults(false);
  }

  function findRoute() {
    if (!start || !dest) return;
    setSelected(null);
    plan.mutate({ from: start, to: dest, time });
  }

  const results = geocode.data ?? [];

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Safe route" />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* FROM — current location, with a re-locate control. */}
        <View style={styles.fromRow}>
          <Icon name="locate-fixed" size={18} color={colors.moss600} />
          <View style={{ flex: 1 }}>
            <Text style={styles.fromLabel}>FROM</Text>
            <Text style={styles.fromValue} numberOfLines={1}>
              {locating
                ? 'Locating…'
                : start
                  ? isWeb
                    ? 'Hyderabad (demo start)'
                    : `Current location · ${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}`
                  : 'Locating…'}
            </Text>
          </View>
          <IconButton icon="locate-fixed" variant="glass" size="sm" onPress={locate} />
        </View>

        {/* GOING TO — type to search, or tap the map. */}
        <View style={{ gap: 6, zIndex: 20 }}>
          <Input
            label="GOING TO"
            icon="map-pin"
            editable
            value={search}
            placeholder="Search a place, or tap the map"
            onChangeText={(t) => {
              setSearch(t);
              setShowResults(true);
              if (destName) setDestName('');
            }}
          />
          {showResults && debounced.trim().length >= 3 ? (
            <View style={[styles.results, cardShadow]}>
              {geocode.isFetching ? (
                <View style={styles.resultRow}>
                  <ActivityIndicator size="small" color={colors.ink500} />
                  <Text style={styles.resultText}>Searching…</Text>
                </View>
              ) : results.length ? (
                results.map((r, i) => (
                  <Pressable
                    key={`${r.lat}-${r.lng}-${i}`}
                    onPress={() => pickResult(r)}
                    style={styles.resultRow}
                  >
                    <Icon name="map-pin" size={16} color={colors.ink400} />
                    <Text style={styles.resultText} numberOfLines={1}>
                      {r.name}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={[styles.resultText, { padding: 12 }]}>No matches near Hyderabad.</Text>
              )}
            </View>
          ) : null}
        </View>

        {/* Day / night — night up-weights sexual-offence, robbery, assault, homicide. */}
        <View style={styles.toggle}>
          {(['day', 'night'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTime(t)}
              style={[styles.toggleBtn, time === t && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, time === t && styles.toggleTextActive]}>
                {t === 'day' ? 'Daytime' : 'Night'}
              </Text>
            </Pressable>
          ))}
        </View>

        <RouteMap
          start={start}
          dest={dest}
          routes={routes}
          selected={selected}
          incidents={incidents}
          onPickDest={dropPin}
        />

        <Button
          variant="primary"
          size="lg"
          icon="route"
          fullWidth
          disabled={!start || !dest || plan.isPending}
          onPress={findRoute}
        >
          {plan.isPending ? 'Finding safest route…' : 'Find safe route'}
        </Button>

        {plan.isError ? (
          <Text style={styles.error}>Couldn’t plan a route. Is the routing server reachable?</Text>
        ) : null}

        {routes.length ? (
          <View style={{ gap: 12 }}>
            {routes.map((r) => (
              <RouteCard
                key={r.kind}
                route={r}
                active={selected ? selected === r.kind : r.kind.startsWith('safest')}
                maxExposure={maxExposure}
                shortest={shortest}
                onPress={() => setSelected(r.kind)}
              />
            ))}
            {plan.data?.engine ? (
              <Text style={styles.engine}>Roads: {plan.data.engine} · exposure = crime-news proximity</Text>
            ) : null}
          </View>
        ) : null}

        {routes.length ? (
          <Button
            variant="secondary"
            size="lg"
            icon="navigation"
            fullWidth
            onPress={() => router.navigate('/map')}
          >
            Start journey with check-in
          </Button>
        ) : null}
      </ScrollView>
    </View>
  );
}

function RouteCard({
  route,
  active,
  maxExposure,
  shortest,
  onPress,
}: {
  route: PlannedRoute;
  active: boolean;
  maxExposure: number;
  shortest: PlannedRoute | null;
  onPress: () => void;
}) {
  const isSafest = route.kind.startsWith('safest');
  const barColor = isSafest ? colors.moss600 : colors.coral500;
  // Lower exposure = safer; bar fills more for higher (worse) exposure.
  const pct = `${Math.round((route.exposure / maxExposure) * 100)}%` as const;
  const km = (route.length_m / 1000).toFixed(1);
  const min = Math.max(1, Math.round(route.duration_s / 60));

  let why = 'Lowest crime-news exposure on the way.';
  if (isSafest && shortest && shortest !== route) {
    const dd = Math.round((100 * (route.length_m - shortest.length_m)) / Math.max(shortest.length_m, 1));
    const de = Math.round((100 * (shortest.exposure - route.exposure)) / Math.max(shortest.exposure, 1e-9));
    why = `${de}% less exposure than the shortest route for ${dd >= 0 ? '+' : ''}${dd}% distance.`;
  } else if (route.kind.includes('shortest')) {
    why = 'Shortest route — higher crime-news exposure.';
  }

  return (
    <Pressable onPress={onPress} style={[styles.route, cardShadow, active && styles.routeActive]}>
      <View style={styles.routeHead}>
        <Text style={styles.routeName}>{isSafest ? 'Safest route' : 'Alternative'}</Text>
        <Text style={styles.routeTime}>
          {km} km · {min} min
        </Text>
      </View>
      <View style={styles.barRow}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: pct, backgroundColor: barColor }]} />
        </View>
        <Text style={[styles.score, { color: barColor }]}>{route.exposure}</Text>
      </View>
      <Text style={styles.why}>{why}</Text>
    </Pressable>
  );
}

function RouteMap({
  start,
  dest,
  routes,
  selected,
  incidents,
  onPickDest,
}: {
  start: LatLng | null;
  dest: LatLng | null;
  routes: PlannedRoute[];
  selected: string | null;
  incidents: { lat: number; lon: number; sev: number; type: string }[];
  onPickDest: (c: LatLng) => void;
}) {
  // react-native-maps has no real web support; render the stylized canvas there.
  if (Platform.OS === 'web') {
    return <MapCanvas route style={styles.map} />;
  }

  // Lazy-require so react-native-maps never enters the web bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: MapView, Marker, Polyline, Circle } = require('react-native-maps');

  const region = start
    ? { latitude: start.lat, longitude: start.lng, latitudeDelta: 0.08, longitudeDelta: 0.08 }
    : geo.region;

  const toCoords = (r: PlannedRoute) =>
    r.coords.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));

  return (
    <View style={styles.map}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation
        showsCompass={false}
        onPress={(e: any) =>
          onPickDest({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })
        }
      >
        {/* Crime incidents — redder/larger with severity. */}
        {incidents.map((inc, i) => (
          <Circle
            key={`inc-${i}`}
            center={{ latitude: inc.lat, longitude: inc.lon }}
            radius={220}
            strokeColor="rgba(255,74,60,0.35)"
            fillColor={`rgba(255,74,60,${0.08 + 0.04 * inc.sev})`}
            strokeWidth={1}
          />
        ))}

        {/* Alternatives first (dashed coral), safest / selected on top. */}
        {routes.map((r) => {
          const isSafest = r.kind.startsWith('safest');
          const isSelected = selected ? selected === r.kind : isSafest;
          return (
            <Polyline
              key={r.kind}
              coordinates={toCoords(r)}
              strokeColor={isSafest ? colors.moss600 : colors.coral500}
              strokeWidth={isSelected ? 7 : 4}
              lineDashPattern={isSafest ? undefined : [10, 8]}
              zIndex={isSelected ? 3 : isSafest ? 2 : 1}
            />
          );
        })}

        {dest ? (
          <Marker coordinate={{ latitude: dest.lat, longitude: dest.lng }} pinColor={colors.ink900} />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 16 },
  fromRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    ...cardShadow,
  },
  fromLabel: {
    fontFamily: figtree(700),
    fontSize: 12,
    letterSpacing: 1.1,
    color: colors.ink500,
  },
  fromValue: { fontFamily: figtree(600), fontSize: 15, color: colors.ink900, marginTop: 1 },
  results: {
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ink100,
  },
  resultText: { flex: 1, fontFamily: figtree(500), fontSize: 14, color: colors.ink700 },
  toggle: { flexDirection: 'row', backgroundColor: colors.ink100, borderRadius: 99, padding: 4 },
  toggleBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 99 },
  toggleBtnActive: { backgroundColor: colors.white, ...cardShadow },
  toggleText: { fontFamily: figtree(700), fontSize: 14, color: colors.ink500 },
  toggleTextActive: { color: colors.ink900 },
  map: { height: 260, borderRadius: 18, overflow: 'hidden', ...cardShadow },
  error: { fontFamily: figtree(500), fontSize: 14, color: colors.coral600, textAlign: 'center' },
  engine: { fontFamily: figtree(400), fontSize: 12, color: colors.ink400, marginTop: 2 },
  route: { backgroundColor: colors.white, borderRadius: 18, padding: 16, gap: 10, borderWidth: 2, borderColor: 'transparent' },
  routeActive: { borderColor: colors.ink900 },
  routeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routeName: { fontFamily: figtree(800), fontSize: 18, letterSpacing: -0.018 * 18, color: colors.ink900 },
  routeTime: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 15, color: colors.ink600 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barTrack: { flex: 1, height: 6, borderRadius: 99, backgroundColor: colors.ink100, overflow: 'hidden' },
  barFill: { height: '100%' },
  score: { fontFamily: figtree(700), fontSize: 13, letterSpacing: 0.4 },
  why: { fontFamily: figtree(400), fontSize: 13, color: colors.ink500, lineHeight: 18 },
});
