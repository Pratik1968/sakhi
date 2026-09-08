import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, figtree, radius } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export function SegmentedControl({
  options,
  value,
  onChange,
  fullWidth,
}: {
  options: readonly string[];
  value: string;
  onChange?: (v: string) => void;
  fullWidth?: boolean;
}) {
  return (
    <View style={[styles.track, fullWidth && { alignSelf: 'stretch' }]}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange?.(opt)}
            style={[styles.seg, active && [styles.segActive, cardShadow]]}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.ink050,
    borderRadius: radius.control,
    padding: 4,
    gap: 4,
    height: 40,
  },
  seg: { flex: 1, borderRadius: radius.xs + 2, alignItems: 'center', justifyContent: 'center' },
  segActive: { backgroundColor: colors.white },
  label: { fontFamily: figtree(600), fontSize: 14, color: colors.ink500, letterSpacing: -0.1 },
  labelActive: { fontFamily: figtree(700), color: colors.ink900 },
});
