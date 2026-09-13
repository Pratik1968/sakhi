import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MapCanvas } from '@/components/app/MapCanvas';
import { MapPin } from '@/components/app/MapPin';
import { MapPinMarker } from '@/components/app/MapPinMarker';
import { Badge } from '@/components/core/Badge';
import { Button } from '@/components/core/Button';
import { Icon } from '@/components/core/Icon';
import { IconButton } from '@/components/core/IconButton';
import { Input } from '@/components/core/Input';
import { StatusPill } from '@/components/core/StatusPill';
import {
  usePingLocation,
  useGeocode,
  usePlanRoute,
  useLatestLocation,
  useGuardians,
  useGuardianLocations,
} from '@/hooks/queries';
import { LocationPing, PlannedRoute, RouteIncident } from '@/lib/types';
import { timeAgo } from '@/lib/format';
import { useAuth } from '@/providers/AuthProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { colors, figtree } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

type LatLng = { lat: number; lng: number };
type GuardianPin = { name: string; location: LocationPing };

// Fallback coordinates (Hyderabad) so the screen is usable on web / before a GPS
// fix — the crime dataset + local OSRM graph both cover Hyderabad.
const FALLBACK_START: LatLng = { lat: 17.435, lng: 78.343 };

const FALLBACK_REGION = {
  latitude: FALLBACK_START.lat,
  longitude: FALLBACK_START.lng,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function regionFrom(loc: { lat: number; lng: number }) {
  return { latitude: loc.lat, longitude: loc.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 };
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const ping = usePingLocation();
  const plan = usePlanRoute();
  const searchRef = useRef<TextInput>(null);
  const { user } = useAuth();
  const { trackingEnabled } = useSettings();
  const { data: location } = useLatestLocation('me');
  const { data: guardianLinks } = useGuardians();
  const guardianCount = guardianLinks?.length ?? 0;

  // Active, app-user guardians can share their live location back to the owner.
  // Fetch each one's latest position and pair it with the guardian's name.
  const activeGuardians = useMemo(
    () => (guardianLinks ?? []).filter((g) => g.status === 'ACTIVE' && g.guardianUserId),
    [guardianLinks],
  );
  const guardianIds = useMemo(
    () => activeGuardians.map((g) => g.guardianUserId as string),
    [activeGuardians],
  );
  const guardianLocs = useGuardianLocations(guardianIds);
  const guardianPins = useMemo(
    () =>
      guardianLocs.map((gl) => ({
        name: activeGuardians.find((g) => g.guardianUserId === gl.userId)?.name ?? 'Guardian',
        location: gl.location,
      })),
    [guardianLocs, activeGuardians],
  );

  const isWeb = Platform.OS === 'web';
  const [time, setTime] = useState<'day' | 'night'>('night');
  const [start, setStart] = useState<LatLng | null>(isWeb ? FALLBACK_START : null);
  const [dest, setDest] = useState<LatLng | null>(null);
  const [destName, setDestName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  // In-map navigation: once a journey starts we keep the route drawn and follow
  // the live location. `checkedInAt` timestamps the last manual guardian check-in.
  const [navigating, setNavigating] = useState(false);
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);

  // Destination search: debounce the text before geocoding.
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [showResults, setShowResults] = useState(false);
  const geocode = useGeocode(debounced);

  // Push live location to the backend so active guardians receive it (native
  // only) and seed the journey start from the first fix. Gated on the tracking
  // preference: when sharing is OFF we neither watch position nor ping, and
  // toggling OFF tears down the existing subscription (cleanup below re-runs).
  useEffect(() => {
    if (isWeb || !trackingEnabled) return;
    let cancelled = false;
    let sub: Location.LocationSubscription | undefined;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setStart((s) => s ?? FALLBACK_START);
        return;
      }
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 8000, distanceInterval: 25 },
        (pos) => {
          ping.mutate({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? undefined,
          });
          setStart((s) => s ?? { lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
      );
      // If the effect was torn down (e.g. tracking toggled OFF) while the
      // subscription was resolving, stop it immediately — the cleanup already ran.
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
  }, [trackingEnabled]);

  // Fall back to the last server-known location as the journey start when no live
  // GPS fix has landed yet, so route planning can proceed (esp. on native, and
  // before the watch delivers its first position). `s ?? …` never overwrites a
  // real fix or the web fallback.
  useEffect(() => {
    if (!location) return;
    setStart((s) => s ?? { lat: location.lat, lng: location.lng });
  }, [location]);

  // Debounce the search box (350ms) before hitting the geocoder.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Plan the safest route as soon as we have both ends — re-plans when the
  // destination or the day/night weighting changes, or once the GPS fix lands.
  useEffect(() => {
    // Don't re-plan mid-journey: a re-plan briefly empties `routes`, which would
    // drop us out of the navigating sheet and re-frame the map.
    if (start && dest && !navigating) plan.mutate({ from: start, to: dest, time });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, dest, time, navigating]);

  const routes = useMemo(() => plan.data?.routes ?? [], [plan.data]);
  const incidents = useMemo(() => plan.data?.incidents ?? [], [plan.data]);
  const shortest = useMemo(
    () => (routes.length ? routes.reduce((s, r) => (r.length_m < s.length_m ? r : s), routes[0]) : null),
    [routes],
  );
  const maxExposure = useMemo(() => Math.max(1, ...routes.map((r) => r.exposure)), [routes]);

  // The route the journey follows: the explicitly selected one, else the safest,
  // else the first available. Null until a plan has landed.
  const activeRoute = useMemo(() => {
    if (!routes.length) return null;
    return (
      routes.find((r) => r.kind === selected) ??
      routes.find((r) => r.kind.startsWith('safest')) ??
      routes[0]
    );
  }, [routes, selected]);

  function pickResult(r: { name: string; lat: number; lng: number }) {
    setDest({ lat: r.lat, lng: r.lng });
    // Keep the first, most specific part of the OSM display name.
    const short = r.name.split(',').slice(0, 2).join(',');
    setDestName(short);
    setSearch(short);
    setShowResults(false);
    setSelected(null);
  }

  function dropPin(c: LatLng) {
    setDest(c);
    setDestName(`Pin · ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`);
    setSearch('');
    setShowResults(false);
    setSelected(null);
  }

  // Kick off the safe-route flow from the live card: reveal the destination
  // prompt and focus the search box so the next keystroke / map tap sets a dest.
  function beginRoute() {
    setShowResults(true);
    searchRef.current?.focus();
  }

  function clearDest() {
    setDest(null);
    setDestName('');
    setSearch('');
    setDebounced('');
    setShowResults(false);
    setSelected(null);
    setNavigating(false);
    setCheckedInAt(null);
    plan.reset();
  }

  // Start the in-map navigating mode — keep the destination, routes and selection
  // as they are; the sheet swaps to NavSheet and the map follows the live fix.
  function onStart() {
    if (activeRoute) setNavigating(true);
  }

  // Manual check-in: push the current position so guardians get a fresh fix,
  // then stamp the check-in time for the sheet.
  function checkIn() {
    const here = location ?? start;
    if (here) ping.mutate({ lat: here.lat, lng: here.lng });
    setCheckedInAt(new Date().toISOString());
  }

  const results = geocode.data ?? [];
  const planning = plan.isPending || plan.isError || routes.length > 0;

  return (
    <View style={styles.screen}>
      <RealMap
        dest={dest}
        routes={routes}
        selected={selected}
        incidents={incidents}
        location={location ?? null}
        guardians={guardianPins}
        userName={user?.name ?? 'You'}
        navigating={navigating}
        onPickDest={dropPin}
      />

      {/* Top overlay: live status + destination search. */}
      <View pointerEvents="box-none" style={[styles.top, { top: insets.top + 12 }]}>
        <View pointerEvents="box-none" style={styles.topRow}>
          {location ? (
            <StatusPill tone="safe" label="Live tracking" meta={timeAgo(location.recordedAt)} filled />
          ) : (
            <StatusPill tone="offline" label="No location yet" filled />
          )}
          <View style={styles.toggle}>
            {(['day', 'night'] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTime(t)}
                style={[styles.toggleBtn, time === t && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleText, time === t && styles.toggleTextActive]}>
                  {t === 'day' ? 'Day' : 'Night'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Input
          ref={searchRef}
          icon="map-pin"
          editable
          value={search}
          placeholder="Search a place, or tap the map"
          onChangeText={(t) => {
            setSearch(t);
            setShowResults(true);
            if (destName) setDestName('');
          }}
          trailing={
            dest || search ? (
              <Pressable onPress={clearDest} hitSlop={8}>
                <Icon name="x" size={18} color={colors.ink400} />
              </Pressable>
            ) : null
          }
        />

        {showResults ? (
          <View style={[styles.results, cardShadow]}>
            {debounced.trim().length < 3 ? (
              <Text style={[styles.resultText, { padding: 12 }]}>
                Type a place, or tap the map to drop a destination pin.
              </Text>
            ) : geocode.isFetching ? (
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

      {/* Bottom sheet: swaps between the live card and the planned route. */}
      <View style={[styles.sheet, { bottom: insets.bottom + 12 }]}>
        {navigating && activeRoute ? (
          <NavSheet
            route={activeRoute}
            destName={destName}
            checkedInAt={checkedInAt}
            onCheckIn={checkIn}
            onEnd={clearDest}
          />
        ) : planning ? (
          <PlanSheet
            plan={plan}
            routes={routes}
            selected={selected}
            shortest={shortest}
            maxExposure={maxExposure}
            destName={destName}
            onSelect={setSelected}
            onClear={clearDest}
            onStart={onStart}
          />
        ) : (
          <LiveSheet
            onGetRoute={beginRoute}
            guardianCount={guardianCount}
            location={location ?? null}
          />
        )}
      </View>
    </View>
  );
}

function LiveSheet({
  onGetRoute,
  guardianCount,
  location,
}: {
  onGetRoute: () => void;
  guardianCount: number;
  location: LocationPing | null;
}) {
  return (
    <>
      <View style={styles.sheetHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Not navigating</Text>
          <Text style={styles.sub}>
            {location ? `Location updated ${timeAgo(location.recordedAt)}` : 'No location yet'}
          </Text>
        </View>
      </View>
      <View style={styles.geofence}>
        <Badge tone="neutral">{`${guardianCount} guardian${guardianCount === 1 ? '' : 's'}`}</Badge>
      </View>
      <View style={styles.actions}>
        <View style={styles.btn}>
          <Button variant="primary" icon="share" fullWidth>
            Share link
          </Button>
        </View>
        <View style={styles.btn}>
          <Button variant="secondary" icon="route" fullWidth onPress={onGetRoute}>
            Safe route
          </Button>
        </View>
      </View>
    </>
  );
}

function PlanSheet({
  plan,
  routes,
  selected,
  shortest,
  maxExposure,
  destName,
  onSelect,
  onClear,
  onStart,
}: {
  plan: ReturnType<typeof usePlanRoute>;
  routes: PlannedRoute[];
  selected: string | null;
  shortest: PlannedRoute | null;
  maxExposure: number;
  destName: string;
  onSelect: (kind: string) => void;
  onClear: () => void;
  onStart: () => void;
}) {
  return (
    <>
      <View style={styles.sheetHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Safe route</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {destName || 'Destination'}
          </Text>
        </View>
        <Pressable onPress={onClear} hitSlop={8} style={styles.closeBtn}>
          <Icon name="x" size={18} color={colors.ink500} />
        </Pressable>
      </View>

      {plan.isPending ? (
        <View style={styles.pending}>
          <ActivityIndicator size="small" color={colors.moss600} />
          <Text style={styles.geoLabel}>Finding safest route…</Text>
        </View>
      ) : plan.isError ? (
        <Text style={styles.error}>Couldn’t plan a route. Is the routing server reachable?</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {routes.map((r) => (
            <RouteCard
              key={r.kind}
              route={r}
              active={selected ? selected === r.kind : r.kind.startsWith('safest')}
              maxExposure={maxExposure}
              shortest={shortest}
              onPress={() => onSelect(r.kind)}
            />
          ))}
          {plan.data?.engine ? (
            <Text style={styles.engine}>
              Roads: {plan.data.engine} · exposure = crime-news proximity
            </Text>
          ) : null}
          <Button variant="primary" size="lg" icon="navigation" fullWidth onPress={onStart}>
            Start journey with check-in
          </Button>
        </View>
      )}
    </>
  );
}

function NavSheet({
  route,
  destName,
  checkedInAt,
  onCheckIn,
  onEnd,
}: {
  route: PlannedRoute;
  destName: string;
  checkedInAt: string | null;
  onCheckIn: () => void;
  onEnd: () => void;
}) {
  const km = (route.length_m / 1000).toFixed(1);
  const min = Math.max(1, Math.round(route.duration_s / 60));
  return (
    <>
      <View style={styles.sheetHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Navigating</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {destName || 'Destination'}
          </Text>
        </View>
        <StatusPill tone="safe" label="On the way" filled />
      </View>

      <View style={styles.navMeta}>
        <Text style={styles.eta}>
          {km} km · {min} min
        </Text>
        {checkedInAt ? (
          <Text style={styles.sub}>Checked in {timeAgo(checkedInAt)}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <View style={styles.btn}>
          <Button variant="secondary" icon="shield-check" fullWidth onPress={onCheckIn}>
            Check in
          </Button>
        </View>
        <View style={styles.btn}>
          <Button variant="primary" icon="x" fullWidth onPress={onEnd}>
            End journey
          </Button>
        </View>
      </View>
    </>
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
    <Pressable onPress={onPress} style={[styles.route, active && styles.routeActive]}>
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

function RealMap({
  dest,
  routes,
  selected,
  incidents,
  location,
  guardians,
  userName,
  navigating,
  onPickDest,
}: {
  dest: LatLng | null;
  routes: PlannedRoute[];
  selected: string | null;
  incidents: RouteIncident[];
  location: LocationPing | null;
  guardians: GuardianPin[];
  userName: string;
  navigating: boolean;
  onPickDest: (c: LatLng) => void;
}) {
  const mapRef = useRef<any>(null);
  const planning = routes.length > 0;

  const toCoords = (r: PlannedRoute) =>
    r.coords.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));

  // Frame the planned route once it arrives (native maps only).
  useEffect(() => {
    if (!routes.length || !mapRef.current) return;
    const safest = routes.find((r) => r.kind.startsWith('safest')) ?? routes[0];
    const coords = toCoords(safest);
    if (coords.length) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 120, right: 60, bottom: 320, left: 60 },
        animated: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes]);

  // Frame the user's real position when it arrives (unless planning a route,
  // where fitToCoordinates frames the trip instead). If guardians are sharing
  // their location too, fit to include both the user and every guardian pin so
  // "You" and your guardians are all visible.
  const guardianKey = guardians.map((g) => `${g.location.lat},${g.location.lng}`).join('|');
  useEffect(() => {
    if (!location || planning || !mapRef.current) return;
    if (guardians.length) {
      const coords = [
        { latitude: location.lat, longitude: location.lng },
        ...guardians.map((g) => ({ latitude: g.location.lat, longitude: g.location.lng })),
      ];
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 120, right: 60, bottom: 320, left: 60 },
        animated: true,
      });
      return;
    }
    mapRef.current.animateToRegion(regionFrom(location), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lng, guardianKey, planning]);

  // During an active journey, follow "You": recenter on each live fix. The
  // route-fit effect above only fires when routes first arrive, so it won't
  // fight this — the follow keeps the user centered while the polyline stays lit.
  useEffect(() => {
    if (!navigating || !location || !mapRef.current) return;
    mapRef.current.animateToRegion(regionFrom(location), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigating, location?.lat, location?.lng]);

  // react-native-maps has no real web support; render the stylized canvas there.
  if (Platform.OS === 'web') {
    // The canvas is decorative (non-geographic), so guardian pins are staggered
    // at fixed offsets purely to show the concept on web. Native plots real coords.
    return (
      <MapCanvas zone route style={styles.fill}>
        {location ? (
          <MapPin name={userName} tone="coral" size={56} label="You" left="50%" top="50%" />
        ) : null}
        {guardians.map((g, i) => (
          <MapPin
            key={`guardian-${i}`}
            name={g.name}
            tone="lilac"
            size={52}
            label={g.name.split(' ')[0]}
            left={`${35 + i * 18}%`}
            top="38%"
          />
        ))}
      </MapCanvas>
    );
  }

  // Lazy-require so react-native-maps never enters the web bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: MapView, Marker, Polyline, Circle } = require('react-native-maps');

  return (
    // Default provider = Apple Maps on iOS (no API key), Google Maps on Android.
    <MapView
      ref={mapRef}
      style={styles.fill}
      initialRegion={location ? regionFrom(location) : FALLBACK_REGION}
      showsUserLocation
      showsCompass={false}
      onPress={(e: any) =>
        onPickDest({
          lat: e.nativeEvent.coordinate.latitude,
          lng: e.nativeEvent.coordinate.longitude,
        })
      }
    >
      {/* The user's own live position. */}
      {location ? (
        <Marker
          coordinate={{ latitude: location.lat, longitude: location.lng }}
          anchor={{ x: 0.5, y: 1 }}
        >
          <MapPinMarker name={userName} tone="coral" size={56} label="You" />
        </Marker>
      ) : null}

      {/* Active guardians sharing their live location (real data only). */}
      {guardians.map((g, i) => (
        <Marker
          key={`guardian-${i}`}
          coordinate={{ latitude: g.location.lat, longitude: g.location.lng }}
          anchor={{ x: 0.5, y: 1 }}
        >
          <MapPinMarker name={g.name} tone="lilac" size={52} label={g.name.split(' ')[0]} />
        </Marker>
      ))}

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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.mapBase },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  top: { position: 'absolute', left: 14, right: 14, gap: 8, zIndex: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 99, padding: 3, ...cardShadow },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99 },
  toggleBtnActive: { backgroundColor: colors.ink900 },
  toggleText: { fontFamily: figtree(700), fontSize: 13, color: colors.ink500 },
  toggleTextActive: { color: colors.white },
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ink050,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: figtree(800), fontSize: 21, letterSpacing: -0.024 * 21, color: colors.ink900 },
  sub: { fontFamily: figtree(400), fontSize: 14, color: colors.ink500, marginTop: 2 },
  etaLabel: { fontFamily: figtree(700), fontSize: 13, letterSpacing: 1.17, color: colors.ink500 },
  eta: { fontFamily: 'IBMPlexMono_600SemiBold', fontSize: 18, color: colors.ink900 },
  geofence: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  navMeta: { gap: 2 },
  geoLabel: { fontFamily: figtree(400), fontSize: 14, color: colors.ink500 },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1 },
  pending: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  error: { fontFamily: figtree(500), fontSize: 14, color: colors.coral600 },
  engine: { fontFamily: figtree(400), fontSize: 12, color: colors.ink400 },
  route: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: 2,
    borderColor: colors.ink100,
  },
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
