import { StyleSheet, Text, View } from 'react-native';
import { colors, figtree, radius, space, type } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';
import { Icon } from '@/components/core/Icon';

type Tone = 'safe' | 'alert' | 'rest' | 'neutral';

const METRIC: Record<Tone, string> = {
  safe: colors.moss600,
  alert: colors.coral600,
  rest: colors.lilac600,
  neutral: colors.ink900,
};

export function StatCard({
  title,
  label,
  value,
  unit,
  tone = 'neutral',
  bars,
}: {
  title: string;
  label?: string;
  value?: string;
  unit?: string;
  tone?: Tone;
  bars?: number[];
}) {
  const metric = METRIC[tone];
  return (
    <View style={[styles.card, cardShadow]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Icon name="chevron-right" size={18} color={colors.ink300} />
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {value ? (
        <Text style={[styles.value, { color: metric }]}>
          {value}
          {unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>
      ) : null}
      {bars && bars.length ? (
        <View style={styles.bars}>
          {bars.map((h, i) => (
            <View key={i} style={styles.barCol}>
              <View
                style={{
                  height: `${Math.max(4, h)}%`,
                  backgroundColor: metric,
                  borderRadius: 3,
                  opacity: 0.25 + (0.75 * (i + 1)) / bars.length,
                }}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: space.cardPadding,
    minHeight: 140,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: {
    fontFamily: figtree(700),
    fontSize: type.title3.fontSize,
    letterSpacing: -0.014 * 17,
    color: colors.ink900,
  },
  label: {
    fontFamily: figtree(700),
    fontSize: 13,
    letterSpacing: 1.17,
    textTransform: 'uppercase',
    color: colors.ink500,
    marginTop: 12,
  },
  value: {
    fontFamily: figtree(800),
    fontSize: type.metric.fontSize,
    letterSpacing: type.metric.letterSpacing,
    marginTop: 4,
  },
  unit: { fontFamily: figtree(800), fontSize: 20 },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 46,
    paddingTop: 10,
    marginTop: 'auto',
  },
  barCol: { flex: 1, height: '100%', justifyContent: 'flex-end' },
});
