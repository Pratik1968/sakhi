import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubHeader } from '@/components/app/SubHeader';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { ListRow } from '@/components/core/ListRow';
import { SegmentedControl } from '@/components/core/SegmentedControl';
import { delayOptions, fakeOpts } from '@/data/sakhi';
import { colors, figtree, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

// "Rings in" options mapped to a delay in seconds.
const DELAY_SECONDS: Record<string, number> = { Now: 0, '10 s': 10, '1 min': 60 };

export default function FakeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [caller, setCaller] = useState('');
  const [delay, setDelay] = useState('10 s');
  const [opts, setOpts] = useState<boolean[]>(fakeOpts.map((o) => o.on));
  // Seconds left before the call rings, or null when idle.
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Clear any pending timer if the screen is torn down.
  useEffect(() => clearTimer, []);

  const goRinging = () => {
    clearTimer();
    setCountdown(null);
    router.push({ pathname: '/ringing', params: { caller: caller.trim() || 'Incoming call' } });
  };

  const onRing = () => {
    // Tapping again while counting down cancels the scheduled call.
    if (countdown != null) {
      clearTimer();
      setCountdown(null);
      return;
    }
    const secs = DELAY_SECONDS[delay] ?? 0;
    if (secs <= 0) {
      goRinging();
      return;
    }
    let remaining = secs;
    setCountdown(remaining);
    timerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) goRinging();
      else setCountdown(remaining);
    }, 1000);
  };

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Fake call" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          A believable incoming call, with a voice on the other end. Use it to leave a room without
          explaining yourself.
        </Text>

        <Input
          label="CALLER NAME"
          icon="phone-call"
          editable
          value={caller}
          onChangeText={setCaller}
          placeholder="e.g. Dad, Mom, Boss"
        />

        <View>
          <Text style={styles.label}>Rings in</Text>
          <SegmentedControl options={delayOptions} value={delay} onChange={setDelay} fullWidth />
        </View>

        <View style={styles.card}>
          {fakeOpts.map((f, i) => (
            <ListRow
              key={f.title}
              divider={i < fakeOpts.length - 1}
              chevron={false}
              title={f.title}
              subtitle={f.sub}
              trailing={
                <Switch
                  value={opts[i]}
                  onValueChange={(v) => setOpts((s) => s.map((x, j) => (j === i ? v : x)))}
                  trackColor={{ true: colors.moss500, false: colors.ink200 }}
                  thumbColor={colors.white}
                />
              }
            />
          ))}
        </View>

        <Button
          variant="primary"
          size="lg"
          icon={countdown != null ? 'x' : 'phone-call'}
          fullWidth
          onPress={onRing}
        >
          {countdown != null ? `Ringing in ${countdown}s · Tap to cancel` : 'Ring me now'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 20 },
  intro: { fontFamily: figtree(400), fontSize: 15, color: colors.ink600, lineHeight: 22 },
  label: { fontFamily: figtree(700), fontSize: 13, letterSpacing: 1.17, textTransform: 'uppercase', color: colors.ink500, marginBottom: 10 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, paddingHorizontal: space.cardPadding, ...cardShadow },
});
