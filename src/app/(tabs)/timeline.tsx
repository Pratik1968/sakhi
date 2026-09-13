import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubHeader } from '@/components/app/SubHeader';
import { ListRow } from '@/components/core/ListRow';
import { MetaText, TileView } from '@/components/app/rows';
import { useIncidents } from '@/hooks/queries';
import type { Incident } from '@/lib/types';
import { humanizeType, incidentTile } from '@/lib/incidents';
import { shortDate } from '@/lib/format';
import { colors, radius } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

function coordsLabel(inc: Incident): string | undefined {
  if (inc.lat == null || inc.lng == null) return undefined;
  return `${inc.lat.toFixed(4)}, ${inc.lng.toFixed(4)}`;
}

function subtitleFor(inc: Incident): string {
  const parts = [inc.area, inc.description].filter(Boolean) as string[];
  if (parts.length) return parts.join(' · ');
  return coordsLabel(inc) ?? 'No details';
}

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data } = useIncidents();

  const incidents = (data ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Incident history" subtitle="Reports you've submitted" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {incidents.length === 0 ? (
            <ListRow
              divider={false}
              chevron={false}
              leading={<TileView tile={{ icon: 'clock', bg: colors.ink050, fg: colors.ink500 }} />}
              title="No reports yet"
              subtitle="Reports you submit will appear here."
            />
          ) : (
            incidents.map((inc, i) => (
              <ListRow
                key={inc.id}
                divider={i < incidents.length - 1}
                chevron={false}
                onPress={() => router.navigate(`/incident?id=${inc.id}` as never)}
                leading={<TileView tile={incidentTile(inc.type)} />}
                title={humanizeType(inc.type)}
                subtitle={subtitleFor(inc)}
                trailing={<MetaText>{shortDate(new Date(inc.createdAt))}</MetaText>}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 20 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, paddingHorizontal: 16, ...cardShadow },
});
