import { useRouter } from 'expo-router';
import { useState } from 'react';
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

export default function FakeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [delay, setDelay] = useState('10 s');
  const [opts, setOpts] = useState<boolean[]>(fakeOpts.map((o) => o.on));

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

        <Input label="CALLER NAME" icon="phone-call" value="Appa" />

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

        <Button variant="primary" size="lg" icon="phone-call" fullWidth onPress={() => router.push('/ringing')}>
          Ring me now
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
