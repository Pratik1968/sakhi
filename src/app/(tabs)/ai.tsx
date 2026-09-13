import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubHeader } from '@/components/app/SubHeader';
import { TileView } from '@/components/app/rows';
import { ListRow } from '@/components/core/ListRow';
import { SectionHeader } from '@/components/core/SectionHeader';
import { SegmentedControl } from '@/components/core/SegmentedControl';
import { StatusPill } from '@/components/core/StatusPill';
import { sensNote, sensOptions, signals } from '@/data/sakhi';
import { colors, figtree, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function AiScreen() {
  const insets = useSafeAreaInsets();
  const [sens, setSens] = useState('Balanced');

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="AI threat detection" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.dot} />
            <Text style={styles.heroEyebrow}>On-device · listening</Text>
          </View>
          <Text style={styles.heroTitle}>Nothing unusual right now.</Text>
          <Text style={styles.heroSub}>
            Motion, route, audio and vitals models run together. Only a match leaves your phone.
          </Text>
        </View>

        <View>
          <SectionHeader title="Sensitivity" />
          <SegmentedControl options={sensOptions} value={sens} onChange={setSens} fullWidth />
          <Text style={styles.note}>{sensNote[sens]}</Text>
        </View>

        <View>
          <SectionHeader title="What it watches" />
          <View style={styles.card}>
            {signals.map((s, i) => (
              <ListRow
                key={s.title}
                divider={i < signals.length - 1}
                chevron={false}
                leading={<TileView tile={s.tile} />}
                title={s.title}
                subtitle={s.sub}
                trailing={<StatusPill tone={s.on ? 'safe' : 'offline'} label={s.on ? 'On' : 'Off'} filled />}
              />
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Recent detections" />
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No detections yet</Text>
            <Text style={styles.emptySub}>On-device monitoring is active — nothing unusual to report.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 24 },
  hero: { backgroundColor: colors.ink900, borderRadius: 18, padding: 18, gap: 12 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.moss500 },
  heroEyebrow: { fontFamily: figtree(700), fontSize: 13, letterSpacing: 1.17, textTransform: 'uppercase', color: colors.ink200 },
  heroTitle: { fontFamily: figtree(800), fontSize: 28, letterSpacing: -0.028 * 28, color: colors.white, lineHeight: 31 },
  heroSub: { fontFamily: figtree(400), fontSize: 14, color: colors.ink300, lineHeight: 20 },
  note: { fontFamily: figtree(400), fontSize: 14, color: colors.ink500, marginTop: 10 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, paddingHorizontal: space.cardPadding, ...cardShadow },
  empty: { backgroundColor: colors.white, borderRadius: radius.card, padding: 28, alignItems: 'center', gap: 6, ...cardShadow },
  emptyTitle: { fontFamily: figtree(700), fontSize: 16, color: colors.ink900, textAlign: 'center' },
  emptySub: { fontFamily: figtree(400), fontSize: 14, color: colors.ink500, textAlign: 'center', lineHeight: 20 },
});
