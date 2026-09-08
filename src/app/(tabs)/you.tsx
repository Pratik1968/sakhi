import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app/AppHeader';
import { Banner } from '@/components/app/Banner';
import { LeadView } from '@/components/app/rows';
import { Button } from '@/components/core/Button';
import { ListRow } from '@/components/core/ListRow';
import { SectionHeader } from '@/components/core/SectionHeader';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { account, triggers } from '@/data/sakhi';
import { colors, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const [on, setOn] = useState<boolean[]>(triggers.map((t) => !!t.trailSwitch));

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.white }}>
        <AppHeader title="You" eyebrow="Meera Rajan · O+" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <SectionHeader title="Ways to fire an SOS" />
          <View style={styles.card}>
            {triggers.map((t, i) => (
              <ListRow
                key={t.title}
                divider={i < triggers.length - 1}
                chevron={false}
                leading={<LeadView lead={t.lead} />}
                title={t.title}
                subtitle={t.sub}
                trailing={
                  <Switch
                    value={on[i]}
                    onValueChange={(v) => setOn((s) => s.map((x, j) => (j === i ? v : x)))}
                    trackColor={{ true: colors.moss500, false: colors.ink200 }}
                    thumbColor={colors.white}
                  />
                }
              />
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Account" />
          <View style={styles.card}>
            {account.map((a, i) => (
              <ListRow
                key={a.title}
                divider={i < account.length - 1}
                leading={<LeadView lead={a.lead} />}
                title={a.title}
                subtitle={a.sub}
              />
            ))}
          </View>
        </View>

        <Banner tone="caution" icon="shield-alert" title="Test your SOS" actionLabel="Run a silent test">
          A working SOS is the whole point. Test it monthly.
        </Banner>

        <Button variant="secondary" size="lg" icon="activity" fullWidth onPress={() => router.navigate('/admin')}>
          Control room (admin)
        </Button>
        <Button variant="ghost" size="md" fullWidth onPress={signOut}>
          Sign out
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 14, paddingBottom: 28, gap: space.sectionGap },
  card: { backgroundColor: colors.white, borderRadius: radius.card, paddingHorizontal: space.cardPadding, ...cardShadow },
});
