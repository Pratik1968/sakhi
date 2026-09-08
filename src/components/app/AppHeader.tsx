import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, figtree, type } from '@/theme/tokens';
import { Icon, IconName } from '@/components/core/Icon';

export type HeaderAction = { icon: IconName; label?: string; badge?: number; onPress?: () => void };

export function AppHeader({
  title,
  eyebrow,
  dropdown,
  actions = [],
  onTitlePress,
}: {
  title: string;
  eyebrow?: string;
  dropdown?: boolean;
  actions?: HeaderAction[];
  onTitlePress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Pressable style={styles.titleRow} onPress={onTitlePress} disabled={!onTitlePress}>
          <Text style={styles.title}>{title}</Text>
          {dropdown ? <Icon name="chevron-down" size={22} color={colors.ink900} /> : null}
        </Pressable>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      </View>
      <View style={styles.actions}>
        {actions.map((a, i) => (
          <Pressable key={i} onPress={a.onPress} style={styles.actionBtn}>
            <Icon name={a.icon} size={24} color={colors.ink900} />
            {a.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{a.badge}</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 6,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: colors.white,
  },
  left: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: {
    fontFamily: figtree(800),
    fontSize: type.display.fontSize,
    letterSpacing: type.display.letterSpacing,
    color: colors.ink900,
    lineHeight: 34,
  },
  eyebrow: {
    fontFamily: figtree(700),
    fontSize: 13,
    letterSpacing: 1.17,
    textTransform: 'uppercase',
    color: colors.ink500,
    marginTop: 3,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingTop: 6 },
  actionBtn: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -3,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: colors.coral500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: 10, fontFamily: figtree(700) },
});
