import { StyleSheet, Text, View } from 'react-native';
import { colors, figtree, radius } from '@/theme/tokens';
import { Icon, IconName } from './Icon';

type Tone = 'safe' | 'alert' | 'caution' | 'rest' | 'offline';

const TONES: Record<Tone, { color: string; bg: string; dot: string }> = {
  safe: { color: colors.moss600, bg: colors.moss050, dot: colors.moss500 },
  alert: { color: colors.coral600, bg: colors.coral050, dot: colors.coral500 },
  caution: { color: colors.amber600, bg: colors.amber050, dot: colors.amber500 },
  rest: { color: colors.lilac600, bg: colors.lilac050, dot: colors.lilac500 },
  offline: { color: colors.ink500, bg: colors.ink100, dot: colors.ink400 },
};

export function StatusPill({
  tone = 'safe',
  label,
  meta,
  icon,
  filled,
}: {
  tone?: Tone;
  label: string;
  meta?: string;
  icon?: IconName;
  filled?: boolean;
}) {
  const t = TONES[tone];
  return (
    <View style={[styles.base, { backgroundColor: filled ? t.bg : 'transparent' }]}>
      {icon ? (
        <Icon name={icon} size={15} color={t.color} />
      ) : (
        <View style={[styles.dot, { backgroundColor: t.dot }]} />
      )}
      <Text style={[styles.label, { color: t.color }]}>{label}</Text>
      {meta ? <Text style={styles.meta}>{`· ${meta}`}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  label: { fontFamily: figtree(700), fontSize: 15, letterSpacing: -0.15 },
  meta: { fontFamily: figtree(500), fontSize: 15, color: colors.ink500 },
});
