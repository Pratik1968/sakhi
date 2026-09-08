import { StyleSheet, Text, View } from 'react-native';
import { colors, figtree } from '@/theme/tokens';
import { Icon, IconName } from '@/components/core/Icon';

type Tone = 'alert' | 'caution' | 'safe' | 'neutral';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  alert: { bg: colors.coral050, fg: colors.coral600 },
  caution: { bg: colors.amber050, fg: colors.amber600 },
  safe: { bg: colors.moss050, fg: colors.moss600 },
  neutral: { bg: colors.ink050, fg: colors.ink600 },
};

export function TimelineItem({
  icon,
  tone = 'neutral',
  title,
  place,
  time,
  last,
}: {
  icon: IconName;
  tone?: Tone;
  title: string;
  place?: string;
  time?: string;
  last?: boolean;
}) {
  const t = TONES[tone];
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: t.bg }]}>
          <Icon name={icon} size={16} color={t.fg} />
        </View>
        {!last ? <View style={styles.line} /> : null}
      </View>
      <View style={[styles.body, last && { borderBottomWidth: 0 }]}>
        <View style={styles.head}>
          <Text style={styles.title}>{title}</Text>
          {time ? <Text style={styles.time}>{time}</Text> : null}
        </View>
        {place ? <Text style={styles.place}>{place}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 32 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  line: { flex: 1, width: 2, backgroundColor: colors.ink100, marginTop: 2 },
  body: { flex: 1, paddingBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, fontFamily: figtree(700), fontSize: 15, color: colors.ink900, letterSpacing: -0.1 },
  time: { fontFamily: 'IBMPlexMono_500Medium', fontSize: 12, color: colors.ink400 },
  place: { fontFamily: figtree(400), fontSize: 13, color: colors.ink500, marginTop: 2 },
});
