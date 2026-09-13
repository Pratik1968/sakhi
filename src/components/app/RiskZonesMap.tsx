import { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { MapCanvas } from '@/components/app/MapCanvas';
import { CrimeIncident } from '@/lib/types';
import { weightedSeverity, type Period } from '@/lib/risk';

// Hyderabad fallback so the map isn't blank before incidents load.
const FALLBACK_REGION = {
  latitude: 17.435,
  longitude: 78.343,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

// Legend colours (see src/data/sakhi.ts): map a severity to its risk hex.
function severityColor(sev: number): string {
  if (sev >= 5) return '#B92C22'; // Hotspot
  if (sev === 4) return '#FF4A3C'; // High risk
  if (sev === 3) return '#F2A33C'; // Moderate
  return '#17A86E'; // Safe
}

// Translucent fill of the same hue for the risk circle.
function fillFor(sev: number): string {
  const hex = severityColor(sev);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.22)`;
}

/**
 * The Risk zones screen map. On native it renders a real (non-interactive)
 * react-native-maps view fitted to the incidents' bounding box, plotting each
 * crime incident as a severity-coloured circle; on web it falls back to the
 * stylized MapCanvas. Overlays (the count pill) are passed as children and
 * layered on top. The whole card is static so it reads as a preview.
 */
export function RiskZonesMap({
  incidents,
  period,
  style,
  children,
}: {
  incidents: CrimeIncident[];
  period: Period;
  style?: ViewStyle;
  children?: ReactNode;
}) {
  if (Platform.OS === 'web') {
    // react-native-maps has no web support; keep the count pill working.
    return <MapCanvas style={style}>{children}</MapCanvas>;
  }

  // Lazy-require so react-native-maps never enters the web bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: MapView, Circle } = require('react-native-maps');

  // Fit the view to the incidents' bounding box, with a sensible minimum span
  // so a single/degenerate cluster isn't over-zoomed.
  let region = FALLBACK_REGION;
  if (incidents.length > 0) {
    const lats = incidents.map((i) => i.lat);
    const lons = incidents.map((i) => i.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.02),
      longitudeDelta: Math.max((maxLon - minLon) * 1.5, 0.02),
    };
  }

  return (
    <View style={[styles.wrap, style]}>
      <MapView
        style={StyleSheet.absoluteFill}
        // Static preview: non-interactive so it reads as a snapshot.
        pointerEvents="none"
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {incidents.map((inc) => {
          const sev = weightedSeverity(inc, period);
          return (
            <Circle
              key={inc.id}
              center={{ latitude: inc.lat, longitude: inc.lon }}
              radius={160 + sev * 70}
              strokeColor={severityColor(sev)}
              fillColor={fillFor(sev)}
              strokeWidth={1}
            />
          );
        })}
      </MapView>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', position: 'relative' },
});
