import { DimensionValue, StyleSheet, Text, View } from 'react-native';
import { colors, figtree, radius } from '@/theme/tokens';
import { Avatar } from '@/components/core/Avatar';

type Tone = 'ink' | 'coral' | 'moss' | 'lilac';

// A map marker positioned by percentage inside a MapCanvas: ringed avatar +
// white tail + optional label pill. Anchored so the tail tip sits at (left,top).
export function MapPin({
  name,
  tone = 'coral',
  size = 52,
  label,
  left,
  top,
}: {
  name: string;
  tone?: Tone;
  size?: number;
  label?: string;
  left: DimensionValue;
  top: DimensionValue;
}) {
  return (
    <View style={[styles.wrap, { left, top, marginLeft: -size / 2, marginTop: -size }]}>
      <Avatar name={name} tone={tone} size={size} ring />
      <View style={styles.tail} />
      {label ? (
        <View style={styles.labelPill}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignItems: 'center' },
  tail: {
    marginTop: -4,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
  },
  labelPill: {
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.coral200,
  },
  labelText: { fontFamily: figtree(700), fontSize: 13, color: colors.ink900 },
});
