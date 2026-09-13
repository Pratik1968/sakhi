import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubHeader } from '@/components/app/SubHeader';
import { MetaText, TileView } from '@/components/app/rows';
import { Button } from '@/components/core/Button';
import { Icon } from '@/components/core/Icon';
import { ListRow } from '@/components/core/ListRow';
import { SectionHeader } from '@/components/core/SectionHeader';
import { StatusPill } from '@/components/core/StatusPill';
import type { Tile } from '@/data/sakhi';
import { useEvidence, type Evidence } from '@/hooks/queries';
import { timeAgo } from '@/lib/format';
import { colors, figtree, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

// Only kind + time are real. Map each evidence kind to an honest title and tile.
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

export default function EvidenceScreen() {
  const insets = useSafeAreaInsets();
  const { data: evidence } = useEvidence();
  const items: Evidence[] = evidence ?? [];
  const count = items.length;

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Evidence" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.capture}>
          <View style={styles.captureHead}>
            <Text style={styles.captureTitle}>Capture on SOS</Text>
            <StatusPill tone="safe" label="Armed" filled />
          </View>
          <View style={styles.mediaRow}>
            <View style={styles.media}>
              <Icon name="mic" size={20} color={colors.ink700} />
              <Text style={styles.mediaTitle}>Audio</Text>
              <Text style={styles.mediaSub}>Background, noise-reduced</Text>
            </View>
            <View style={styles.media}>
              <Icon name="video" size={20} color={colors.ink700} />
              <Text style={styles.mediaTitle}>Video</Text>
              <Text style={styles.mediaSub}>Front and rear, 30s loops</Text>
            </View>
          </View>
          <View style={styles.lockRow}>
            <Icon name="lock" size={16} color={colors.ink500} />
            <Text style={styles.lockText}>
              End-to-end encrypted, uploaded as it records. You cannot delete it for 30 days.
            </Text>
          </View>
        </View>

        <View>
          <SectionHeader title="Stored files" meta={`${count} item${count === 1 ? '' : 's'}`} />
          <View style={styles.card}>
            {count === 0 ? (
              <ListRow
                divider={false}
                chevron={false}
                leading={<TileView tile={{ icon: 'lock', bg: colors.ink050, fg: colors.ink500 }} />}
                title="No evidence captured yet"
                subtitle="Recordings from an SOS will appear here."
              />
            ) : (
              items.map((f, i) => {
                const d = kindDisplay(f.kind);
                return (
                  <ListRow
                    key={f.id}
                    divider={i < items.length - 1}
                    chevron={false}
                    leading={<TileView tile={d.tile} />}
                    title={d.title}
                    subtitle={timeAgo(f.createdAt)}
                    trailing={<MetaText>{d.title}</MetaText>}
                  />
                );
              })
            )}
          </View>
        </View>

        <Button variant="secondary" size="lg" icon="share" fullWidth>
          Send a copy to my lawyer
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 22 },
  capture: { backgroundColor: colors.white, borderRadius: 18, padding: 18, gap: 14, ...cardShadow },
  captureHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  captureTitle: { fontFamily: figtree(800), fontSize: 18, letterSpacing: -0.018 * 18, color: colors.ink900 },
  mediaRow: { flexDirection: 'row', gap: 12 },
  media: { flex: 1, backgroundColor: colors.ink050, borderRadius: 14, padding: 14, gap: 8 },
  mediaTitle: { fontFamily: figtree(700), fontSize: 15, color: colors.ink900 },
  mediaSub: { fontFamily: figtree(400), fontSize: 13, color: colors.ink500 },
  lockRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  lockText: { flex: 1, fontFamily: figtree(400), fontSize: 13, color: colors.ink500, lineHeight: 18 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, paddingHorizontal: space.cardPadding, ...cardShadow },
});
