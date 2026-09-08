import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapCanvas } from '@/components/app/MapCanvas';
import { MapPin } from '@/components/app/MapPin';
import { SubHeader } from '@/components/app/SubHeader';
import { TileView } from '@/components/app/rows';
import { ListRow } from '@/components/core/ListRow';
import { SectionHeader } from '@/components/core/SectionHeader';
import { SegmentedControl } from '@/components/core/SegmentedControl';
import { StatusPill } from '@/components/core/StatusPill';
import { legend, periodOptions, pins, zoneRows } from '@/data/sakhi';
import { colors, figtree, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function ZonesScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState('Now');

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Risk zones" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SegmentedControl options={periodOptions} value={period} onChange={setPeriod} fullWidth />

        <MapCanvas style={styles.map}>
          <View style={[styles.blob, { left: '16%', top: '22%', width: 104, height: 88, backgroundColor: 'rgba(255,74,60,.28)', borderColor: 'rgba(255,74,60,.5)' }]} />
          <View style={[styles.blob, { right: '14%', top: '46%', width: 88, height: 74, backgroundColor: 'rgba(242,163,60,.3)', borderColor: 'rgba(242,163,60,.55)' }]} />
          <View style={[styles.blob, { left: '34%', bottom: '12%', width: 96, height: 66, backgroundColor: 'rgba(23,168,110,.24)', borderColor: 'rgba(23,168,110,.5)' }]} />
          {pins.zone.map((p) => (
            <MapPin key={p.name} {...p} />
          ))}
        </MapCanvas>

        <View style={styles.legend}>
          {legend.map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendLabel}>{l.label}</Text>
            </View>
          ))}
        </View>

        <View>
          <SectionHeader title="Around you" meta={period} />
          <View style={styles.card}>
            {zoneRows.map((z, i) => (
              <ListRow
                key={z.title}
                divider={i < zoneRows.length - 1}
                chevron={false}
                leading={<TileView tile={z.tile} />}
                title={z.title}
                subtitle={z.sub}
                trailing={<StatusPill tone={z.pillTone} label={z.pillLabel} filled />}
              />
            ))}
          </View>
        </View>

        <Text style={styles.footnote}>
          Scored from city crime records, verified user reports, street lighting, footfall and the
          hour of the day. Updated every 15 minutes.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 20 },
  map: { height: 200, borderRadius: 18, ...cardShadow },
  blob: { position: 'absolute', borderRadius: 999, borderWidth: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontFamily: figtree(400), fontSize: 13, color: colors.ink600 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, paddingHorizontal: space.cardPadding, ...cardShadow },
  footnote: { fontFamily: figtree(400), fontSize: 13, color: colors.ink400, lineHeight: 18 },
});
