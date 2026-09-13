import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubHeader } from '@/components/app/SubHeader';
import { SectionHeader } from '@/components/core/SectionHeader';
import { ListRow } from '@/components/core/ListRow';
import { TileView } from '@/components/app/rows';
import { useIncidents } from '@/hooks/queries';
import { humanizeType, incidentTile } from '@/lib/incidents';
import { shortDate, timeAgo } from '@/lib/format';
import type { Tile } from '@/data/sakhi';
import { colors, figtree, radius } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

// Map an evidence kind to an honest title + tile (mirrors the Evidence screen).
function kindDisplay(kind: string): { title: string; tile: Tile } {
  switch (kind) {
    case 'AUDIO':
      return { title: 'Audio', tile: { icon: 'mic', bg: colors.lilac050, fg: colors.lilac600 } };
    case 'VIDEO':
      return { title: 'Video', tile: { icon: 'video', bg: colors.ink050, fg: colors.ink700 } };
    case 'IMAGE':
      return { title: 'Image', tile: { icon: 'eye', bg: colors.moss050, fg: colors.moss600 } };
    default:
      return { title: kind, tile: { icon: 'lock', bg: colors.ink050, fg: colors.ink700 } };
  }
}

export default function IncidentDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending } = useIncidents();
  const incident = (data ?? []).find((i) => i.id === id);

  if (!incident) {
    return (
      <View style={styles.screen}>
        <View style={{ paddingTop: insets.top }}>
          <SubHeader title="Report" />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <ListRow
              divider={false}
              chevron={false}
              leading={<TileView tile={{ icon: 'triangle-alert', bg: colors.ink050, fg: colors.ink500 }} />}
              title={isPending ? 'Loading report…' : 'Report not found'}
              subtitle={isPending ? 'Fetching your incident reports.' : 'It may have been removed.'}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  const evidence = incident.evidence ?? [];
  const when = new Date(incident.createdAt);
  const timeStr = when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const detailRows: { label: string; value: string }[] = [];
  if (incident.area) detailRows.push({ label: 'Area', value: incident.area });
  if (incident.description) detailRows.push({ label: 'What happened', value: incident.description });
  if (incident.lat != null && incident.lng != null) {
    detailRows.push({ label: 'Location', value: `${incident.lat.toFixed(4)}, ${incident.lng.toFixed(4)}` });
  }
  detailRows.push({ label: 'Reported', value: `${shortDate(when)} · ${timeStr}` });

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title={humanizeType(incident.type)} subtitle={shortDate(when)} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <ListRow
            divider={false}
            chevron={false}
            leading={<TileView tile={incidentTile(incident.type)} />}
            title={humanizeType(incident.type)}
            subtitle={incident.area ?? 'Reported incident'}
          />
        </View>

        <View>
          <SectionHeader title="Details" />
          <View style={styles.detailCard}>
            {detailRows.map((r, i) => (
              <View
                key={r.label}
                style={[styles.detailRow, i < detailRows.length - 1 && styles.detailDivider]}
              >
                <Text style={styles.detailLabel}>{r.label}</Text>
                <Text style={styles.detailValue}>{r.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Evidence" meta={`${evidence.length} item${evidence.length === 1 ? '' : 's'}`} />
          <View style={styles.card}>
            {evidence.length === 0 ? (
              <ListRow
                divider={false}
                chevron={false}
                leading={<TileView tile={{ icon: 'lock', bg: colors.ink050, fg: colors.ink500 }} />}
                title="No evidence attached"
                subtitle="This report has no photo, video, or audio."
              />
            ) : (
              evidence.map((e, i) => {
                const d = kindDisplay(e.kind);
                return (
                  <ListRow
                    key={e.id}
                    divider={i < evidence.length - 1}
                    onPress={() => WebBrowser.openBrowserAsync(e.url)}
                    leading={
                      e.kind === 'IMAGE' ? (
                        <Image source={{ uri: e.url }} style={styles.thumb} contentFit="cover" />
                      ) : (
                        <TileView tile={d.tile} />
                      )
                    }
                    title={d.title}
                    subtitle={timeAgo(e.createdAt)}
                  />
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 20 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, paddingHorizontal: 16, ...cardShadow },
  detailCard: { backgroundColor: colors.white, borderRadius: radius.card, paddingHorizontal: 16, ...cardShadow },
  detailRow: { paddingVertical: 12, gap: 3 },
  detailDivider: { borderBottomWidth: 1, borderBottomColor: colors.ink100 },
  detailLabel: {
    fontFamily: figtree(700),
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.ink500,
  },
  detailValue: { fontFamily: figtree(500), fontSize: 15, color: colors.ink900, lineHeight: 21 },
  thumb: { width: 38, height: 38, borderRadius: radius.control, backgroundColor: colors.ink050 },
});
