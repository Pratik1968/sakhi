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
import { useGuardians } from '@/hooks/queries';
import { triggers } from '@/data/sakhi';
import { colors, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: guardians } = useGuardians();
  const guardianCount = guardians?.length ?? 0;
  const [on, setOn] = useState<boolean[]>(triggers.map((t) => !!t.trailSwitch));

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.white }}>
        <AppHeader title="You" eyebrow={user?.name ?? 'You'} />
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
            <ListRow
              divider
              leading={<LeadView lead={{ type: 'avatar', name: user?.name ?? 'You', tone: 'lilac' }} />}
              title="Email"
              subtitle={user?.email ?? 'Not signed in'}
            />
            <ListRow
              divider={false}
              leading={<LeadView lead={{ type: 'tile', tile: { icon: 'users', bg: colors.lilac050, fg: colors.lilac600 } }} />}
              title="Guardians"
              subtitle={`${guardianCount} in your circle`}
            />
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
