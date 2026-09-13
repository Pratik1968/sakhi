import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/core/Button';
import { Icon } from '@/components/core/Icon';
import { colors, figtree } from '@/theme/tokens';

type Coord = { lat: number; lng: number };

type Props = {
  visible: boolean;
  initial: Coord | null;
  onConfirm: (c: Coord) => void;
  onCancel: () => void;
};

// Hyderabad fallback — mirrors the map screen's FALLBACK_REGION so the picker
// opens somewhere sensible when there is no starting point.
const FALLBACK_REGION = {
  latitude: 17.435,
  longitude: 78.343,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function regionFrom(c: Coord) {
  return { latitude: c.lat, longitude: c.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 };
}

export function LocationPicker({ visible, initial, onConfirm, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  // Seed the pin from the starting point so "Use this location" works right away.
  const [pin, setPin] = useState<Coord | null>(initial);

  // Re-seed each time the sheet opens (the start point may have changed).
  useEffect(() => {
    if (visible) setPin(initial);
  }, [visible, initial]);

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <Pressable onPress={onCancel} hitSlop={12} style={styles.cancel}>
        <Icon name="x" size={22} color={colors.ink900} />
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
      <Text style={styles.title}>Pin the location</Text>
      <View style={styles.cancel} />
    </View>
  );

  // react-native-maps has no real web support — offer a typed-location fallback.
  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} onRequestClose={onCancel} animationType="slide">
        <View style={styles.screen}>
          {header}
          <View style={styles.webBody}>
            <Icon name="map-pin" size={32} color={colors.ink400} />
            <Text style={styles.webText}>
              Map picker isn&apos;t available on web — type the location instead.
            </Text>
            <Button variant="secondary" size="lg" onPress={onCancel}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    );
  }

  // Lazy-require so react-native-maps never enters the web bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: MapView, Marker } = require('react-native-maps');

  return (
    <Modal visible={visible} onRequestClose={onCancel} animationType="slide">
      <View style={styles.screen}>
        <MapView
          style={styles.fill}
          initialRegion={initial ? regionFrom(initial) : FALLBACK_REGION}
          showsUserLocation
          showsCompass={false}
          onPress={(e: any) =>
            setPin({
              lat: e.nativeEvent.coordinate.latitude,
              lng: e.nativeEvent.coordinate.longitude,
            })
          }
        >
          {pin ? (
            <Marker
              coordinate={{ latitude: pin.lat, longitude: pin.lng }}
              draggable
              onDragEnd={(e: any) =>
                setPin({
                  lat: e.nativeEvent.coordinate.latitude,
                  lng: e.nativeEvent.coordinate.longitude,
                })
              }
              pinColor={colors.coral500}
            />
          ) : null}
        </MapView>

        {header}

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {!pin ? (
            <Text style={styles.hint}>Tap the map to drop a pin. Drag it to fine-tune.</Text>
          ) : null}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!pin}
            onPress={() => pin && onConfirm(pin)}
          >
            Use this location
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  cancel: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 90 },
  cancelText: { fontFamily: figtree(600), fontSize: 16, color: colors.ink900 },
  title: { fontFamily: figtree(800), fontSize: 17, color: colors.ink900 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 10,
    backgroundColor: colors.white,
  },
  hint: { fontFamily: figtree(500), fontSize: 13, color: colors.ink500, textAlign: 'center' },
  webBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  webText: {
    fontFamily: figtree(500),
    fontSize: 15,
    color: colors.ink600,
    textAlign: 'center',
    lineHeight: 22,
  },
});
