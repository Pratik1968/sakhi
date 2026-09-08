import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@/theme/tokens';

/**
 * A stylized, cross-platform map surface matching the design's MapCanvas
 * (no native map dependency). Renders a muted base with decorative roads/parks,
 * an optional coral safe-zone and route, and absolutely-positioned children (pins).
 */
export function MapCanvas({
  zone,
  route,
  style,
  children,
}: {
  zone?: boolean;
  route?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}) {
  return (
    <View style={[styles.base, style]}>
      {/* parks & water patches */}
      <View style={[styles.patch, { backgroundColor: colors.mapPark, left: '6%', top: '10%', width: '30%', height: '34%', borderRadius: 40 }]} />
      <View style={[styles.patch, { backgroundColor: colors.mapWater, right: '4%', bottom: '8%', width: '34%', height: '30%', borderRadius: 30 }]} />
      {/* roads */}
      <View style={[styles.road, { top: '32%', left: '-10%', width: '120%', transform: [{ rotate: '-8deg' }] }]} />
      <View style={[styles.road, { top: '64%', left: '-10%', width: '120%', transform: [{ rotate: '6deg' }] }]} />
      <View style={[styles.roadV, { left: '38%', top: '-10%', height: '120%', transform: [{ rotate: '5deg' }] }]} />

      {zone ? <View style={styles.zone} /> : null}
      {route ? (
        <>
          <View style={[styles.routeSeg, { left: '22%', top: '58%', width: '30%', transform: [{ rotate: '-32deg' }] }]} />
          <View style={[styles.routeSeg, { left: '44%', top: '44%', width: '28%', transform: [{ rotate: '-14deg' }] }]} />
        </>
      ) : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.mapBase, overflow: 'hidden', position: 'relative' },
  patch: { position: 'absolute', opacity: 0.7 },
  road: { position: 'absolute', height: 12, backgroundColor: colors.mapRoad, opacity: 0.9 },
  roadV: { position: 'absolute', width: 10, backgroundColor: colors.mapRoad, opacity: 0.9 },
  zone: {
    position: 'absolute',
    left: '30%',
    top: '32%',
    width: '46%',
    height: '42%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,74,60,.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,74,60,.4)',
  },
  routeSeg: { position: 'absolute', height: 4, borderRadius: 4, backgroundColor: colors.mapRoute },
});
