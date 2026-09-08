import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, figtree } from '@/theme/tokens';
import { Icon } from '@/components/core/Icon';

const HOLD_MS = 1500;

export function SOSHoldBar({ onTrigger }: { onTrigger: () => void }) {
  const [holding, setHolding] = useState(false);
  const progress = useSharedValue(0);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const start = () => {
    setHolding(true);
    progress.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear }, (done) => {
      if (done) {
        runOnJS(setHolding)(false);
        runOnJS(onTrigger)();
      }
    });
  };

  const stop = () => {
    setHolding(false);
    progress.value = withTiming(0, { duration: 160 });
  };

  return (
    <Pressable
      onPressIn={start}
      onPressOut={stop}
      style={[styles.bar, { backgroundColor: holding ? colors.coral600 : colors.coral500 }]}
    >
      <Animated.View style={[styles.fill, fill]} />
      <View style={styles.content}>
        <Icon name="shield-alert" size={28} color={colors.white} />
        <Text style={styles.label}>{holding ? 'Keep holding…' : 'Hold for help'}</Text>
        <Text style={styles.hint}>
          {holding
            ? 'Release to stop'
            : 'Press anywhere on this bar for 1.5s. Nothing happens on a tap.'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { height: 128, overflow: 'hidden', justifyContent: 'center' },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.coral700,
  },
  content: { alignItems: 'center', gap: 8, paddingHorizontal: 20 },
  label: { fontFamily: figtree(800), fontSize: 26, color: colors.white, letterSpacing: -0.7 },
  hint: { fontFamily: figtree(400), fontSize: 14, color: 'rgba(255,255,255,.82)', textAlign: 'center' },
});
