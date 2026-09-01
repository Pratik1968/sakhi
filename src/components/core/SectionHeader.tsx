import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, figtree, type } from '@/theme/tokens';
import { Icon } from './Icon';

export function SectionHeader({
  title,
  meta,
  actionLabel,
  onAction,
  info,
}: {
  title: string;
  meta?: string;
  actionLabel?: string;
  onAction?: () => void;
  info?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {info ? <Icon name="info" size={16} color={colors.ink900} /> : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Icon name="chevron-right" size={18} color={colors.ink900} />
        </Pressable>
      ) : meta ? (
        <Text style={styles.meta}>{meta}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: {
    fontFamily: figtree(800),
    fontSize: type.title2.fontSize,
    letterSpacing: type.title2.letterSpacing,
    color: colors.ink900,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionText: { fontFamily: figtree(700), fontSize: 16, color: colors.ink900 },
  meta: { fontFamily: figtree(500), fontSize: 16, color: colors.ink500 },
});
