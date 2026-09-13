import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Avatar } from '@/components/core/Avatar';
import { Icon } from '@/components/core/Icon';
import { colors, figtree } from '@/theme/tokens';

export default function RingingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { caller } = useLocalSearchParams<{ caller?: string }>();
  const name = caller || 'Incoming call';

  const blink = useSharedValue(1);
  useEffect(() => {
    blink.value = withRepeat(withTiming(0.25, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [blink]);
  const blinkStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  const hangUp = () => (router.canGoBack() ? router.back() : router.navigate('/fake'));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 60 }]}>
      <View style={styles.top}>
        <Text style={styles.incoming}>incoming call</Text>
        <Avatar name={name} size="xl" tone="lilac" ring />
        <Text style={styles.name}>{name}</Text>
        <Animated.Text style={[styles.calling, blinkStyle]}>mobile · calling…</Animated.Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionCol}>
          <Pressable style={[styles.circle, { backgroundColor: colors.coral500 }]} onPress={hangUp}>
            <Icon name="x" size={28} color={colors.white} />
          </Pressable>
          <Text style={styles.actionLabel}>Decline</Text>
        </View>
        <View style={styles.actionCol}>
          <Pressable style={[styles.circle, { backgroundColor: colors.moss500 }]} onPress={hangUp}>
            <Icon name="phone" size={28} color={colors.white} />
          </Pressable>
          <Text style={styles.actionLabel}>Answer</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink800, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32 },
  top: { alignItems: 'center', gap: 14 },
  incoming: { fontFamily: figtree(400), fontSize: 15, color: colors.ink300 },
  name: { fontFamily: figtree(800), fontSize: 32, letterSpacing: -0.028 * 32, color: colors.white },
  calling: { fontFamily: figtree(400), fontSize: 15, color: colors.ink300 },
  actions: { flexDirection: 'row', gap: 52, alignItems: 'center' },
  actionCol: { alignItems: 'center', gap: 10 },
  circle: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: figtree(400), fontSize: 13, color: colors.ink300 },
});
