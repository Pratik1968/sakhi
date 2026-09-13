import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RiskZonesMap } from '@/components/app/RiskZonesMap';
import { SubHeader } from '@/components/app/SubHeader';
import { MetaText, TileView } from '@/components/app/rows';
import { ListRow } from '@/components/core/ListRow';
import { SectionHeader } from '@/components/core/SectionHeader';
import { SegmentedControl } from '@/components/core/SegmentedControl';
import { useCrimeIncidents } from '@/hooks/queries';
import { shortDate } from '@/lib/format';
import { weightedSeverity, type Period } from '@/lib/risk';
import { legend, periodOptions, type Tile } from '@/data/sakhi';
import { colors, figtree, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

// Colour the leading tile by how severe the incident is.
function severityTile(sev: number): Tile {
  if (sev >= 4) return { icon: 'triangle-alert', bg: '#FFF0EE', fg: '#B92C22' };
  if (sev >= 3) return { icon: 'triangle-alert', bg: '#FDF3E5', fg: '#D8861F' };
  return { icon: 'map-pin', bg: '#F3F2F5', fg: '#3A383F' };
}

export default function ZonesScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('Now');
  const { data: crime, isLoading } = useCrimeIncidents();

  const rows = useMemo(
    () =>
      [...(crime ?? [])]
        .sort(
          (a, b) =>
            weightedSeverity(b, period) - weightedSeverity(a, period) ||
            b.severity - a.severity,
        )
        .slice(0, 10),
    [crime, period],
  );

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Risk zones" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SegmentedControl
          options={periodOptions}
          value={period}
          onChange={(v) => setPeriod(v as Period)}
          fullWidth
        />

        <RiskZonesMap incidents={crime ?? []} period={period} style={styles.map}>
          {crime && crime.length > 0 ? (
            <View style={styles.countPill}>
              <Text style={styles.countText}>{crime.length} incidents mapped</Text>
            </View>
          ) : null}
        </RiskZonesMap>

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
            {isLoading ? (
              <ListRow chevron={false} divider={false} title="Loading risk data…" />
            ) : rows.length === 0 ? (
              <ListRow chevron={false} divider={false} title="No risk data for your area yet." />
            ) : (
              rows.map((z, i) => (
                <ListRow
                  key={z.id}
                  divider={i < rows.length - 1}
                  chevron={false}
                  leading={<TileView tile={severityTile(weightedSeverity(z, period))} />}
                  title={z.locality}
                  subtitle={`${z.crimeType} · severity ${z.severity}`}
                  trailing={
                    z.incidentDate ? <MetaText>{shortDate(new Date(z.incidentDate))}</MetaText> : undefined
                  }
                />
              ))
            )}
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
  countPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,.9)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  countText: { fontFamily: figtree(700), fontSize: 13, color: colors.ink900 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontFamily: figtree(400), fontSize: 13, color: colors.ink600 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, paddingHorizontal: space.cardPadding, ...cardShadow },
  footnote: { fontFamily: figtree(400), fontSize: 13, color: colors.ink400, lineHeight: 18 },
});
