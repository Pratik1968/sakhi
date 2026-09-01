import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, figtree } from '@/theme/tokens';
import { Icon } from './Icon';

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  chevron = true,
  divider = true,
  onPress,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  divider?: boolean;
  onPress?: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.row,
        { backgroundColor: pressed && onPress ? colors.ink050 : 'transparent' },
        divider ? styles.divider : null,
      ]}
    >
      {leading}
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing}
      {chevron && !trailing ? <Icon name="chevron-right" size={20} color={colors.ink300} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 44,
    paddingVertical: 12,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.ink100 },
  body: { flex: 1, minWidth: 0 },
  title: { fontFamily: figtree(700), fontSize: 16, color: colors.ink900, letterSpacing: -0.19 },
  subtitle: { fontFamily: figtree(400), fontSize: 14, color: colors.ink500, marginTop: 2 },
});
