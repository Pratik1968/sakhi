import { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { MapCanvas } from '@/components/app/MapCanvas';
import { MapPin } from '@/components/app/MapPin';
import { MapPinMarker } from '@/components/app/MapPinMarker';
import { LocationPing } from '@/lib/types';

// Hyderabad fallback so the preview isn't blank before the first GPS fix.
const FALLBACK_REGION = {
  latitude: 17.435,
  longitude: 78.343,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

/**
 * The Live screen's map preview. On native it renders a real (non-interactive)
 * react-native-maps view centered on the user's latest location with their pin;
 * on web it falls back to the stylized MapCanvas. Overlays (status pill, locate
 * button, address bar) are passed as children and layered on top. The whole card
 * is non-interactive so the parent Pressable can hand off to the full Map tab.
 */
export function LivePreviewMap({
  location,
  userName,
  style,
  children,
}: {
  location: LocationPing | null;
  userName: string;
  style?: ViewStyle;
  children?: ReactNode;
}) {
  if (Platform.OS === 'web') {
    return (
      <MapCanvas zone route style={style}>
        {location ? (
          <MapPin name={userName} tone="coral" size={52} left="50%" top="52%" />
        ) : null}
        {children}
      </MapCanvas>
    );
  }

  // Lazy-require so react-native-maps never enters the web bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: MapView, Marker } = require('react-native-maps');
  const region = location
    ? { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : FALLBACK_REGION;

  return (
    <View style={[styles.wrap, style]}>
      <MapView
        style={StyleSheet.absoluteFill}
        // Static preview: taps fall through to the parent Pressable (→ Map tab).
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
        {location ? (
          <Marker
            coordinate={{ latitude: location.lat, longitude: location.lng }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <MapPinMarker name={userName} tone="coral" size={52} label="You" />
          </Marker>
        ) : null}
      </MapView>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', position: 'relative' },
});
