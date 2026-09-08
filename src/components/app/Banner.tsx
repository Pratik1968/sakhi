import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, figtree, radius } from '@/theme/tokens';
import { Icon, IconName } from '@/components/core/Icon';

type Tone = 'info' | 'safe' | 'alert' | 'caution';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  info: { bg: colors.lilac050, fg: colors.lilac600 },
  safe: { bg: colors.moss050, fg: colors.moss600 },
  alert: { bg: colors.coral050, fg: colors.coral600 },
  caution: { bg: colors.amber050, fg: colors.amber600 },
};

export function Banner({
  tone = 'info',
  icon = 'info',
  title,
  children,
  actionLabel,
  onAction,
}: {
  tone?: Tone;
  icon?: IconName;
  title: string;
  children?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const t = TONES[tone];
  return (
    <View style={[styles.row, { backgroundColor: t.bg }]}>
      <View style={[styles.tile, { backgroundColor: t.fg }]}>
        <Icon name={icon} size={17} color={colors.white} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {children ? <Text style={styles.text}>{children}</Text> : null}
        {actionLabel ? (
          <Pressable onPress={onAction} style={styles.action}>
            <Text style={[styles.actionText, { color: t.fg }]}>{`${actionLabel} →`}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.card },
  tile: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  title: { fontFamily: figtree(700), fontSize: 16, color: colors.ink900, letterSpacing: -0.19 },
  text: { fontFamily: figtree(400), fontSize: 14, color: colors.ink700, marginTop: 2, lineHeight: 20 },
  action: { marginTop: 8 },
  actionText: { fontFamily: figtree(700), fontSize: 14 },
});
