import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, figtree, space } from '@/theme/tokens';
import { Icon, IconName } from '@/components/core/Icon';

export type TabDef = { value: string; label: string; icon: IconName };

export function TabBar({
  tabs,
  value,
  onChange,
}: {
  tabs: TabDef[];
  value: string;
  onChange: (v: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom, height: space.tabbarHeight + insets.bottom }]}>
      {tabs.map((t) => {
        const active = t.value === value;
        const color = active ? colors.ink900 : colors.ink400;
        return (
          <Pressable key={t.value} style={styles.tab} onPress={() => onChange(t.value)}>
            <Icon name={t.icon} size={24} color={color} />
            <Text style={[styles.label, { color, fontFamily: figtree(active ? 700 : 500) }]}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.ink100,
  },
  tab: { flex: 1, alignItems: 'center', gap: 5 },
  label: { fontSize: 12, letterSpacing: -0.06 },
});
