import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/core/Avatar';
import { Icon } from '@/components/core/Icon';
import { colors, figtree } from '@/theme/tokens';

type Tone = 'ink' | 'coral' | 'moss' | 'lilac';

// Circle-tab contact: avatar + first name, or a dashed "add" tile.
export function ContactChip({ name, tone = 'ink', add }: { name?: string; tone?: Tone; add?: boolean }) {
  if (add) {
    return (
      <View style={styles.wrap}>
        <View style={styles.addCircle}>
          <Icon name="plus" size={24} color={colors.ink500} />
        </View>
        <Text style={styles.name}>Add</Text>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      <Avatar name={name} tone={tone} size="lg" />
      <Text style={styles.name} numberOfLines={1}>
        {name?.split(' ')[0]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 64, alignItems: 'center', gap: 8 },
  addCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.ink200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: figtree(600), fontSize: 13, color: colors.ink700 },
});
