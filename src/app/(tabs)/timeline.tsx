import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubHeader } from '@/components/app/SubHeader';
import { StatCard } from '@/components/app/StatCard';
import { TimelineItem } from '@/components/app/TimelineItem';
import { Button } from '@/components/core/Button';
import { bars3, incidentTl } from '@/data/sakhi';
import { colors, radius } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="SOS · 9 Feb" subtitle="Resolved · 4 min 12 s" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stats}>
          <StatCard title="Response" label="FIRST REPLY" value="38" unit="sec" tone="safe" bars={bars3} />
          <StatCard title="Evidence" label="CAPTURED" value="3" unit="files" tone="neutral" />
        </View>

        <View style={styles.timeline}>
          {incidentTl.map((t, i) => (
            <TimelineItem key={i} {...t} last={i === incidentTl.length - 1} />
          ))}
        </View>

        <Button variant="secondary" size="lg" icon="lock" fullWidth onPress={() => router.navigate('/evidence')}>
          Open sealed evidence
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 20 },
  stats: { flexDirection: 'row', gap: 12 },
  timeline: { backgroundColor: colors.white, borderRadius: radius.card, padding: 16, ...cardShadow },
});
