import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, figtree, radius, type } from '@/theme/tokens';
import { Icon } from '@/components/core/Icon';

export function DetailHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/tools'))}
        style={styles.back}
        hitSlop={8}
      >
        <Icon name="chevron-left" size={24} color={colors.ink900} />
      </Pressable>
      <View style={styles.titles}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink050,
  },
  titles: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: figtree(800),
    fontSize: type.title2.fontSize,
    letterSpacing: type.title2.letterSpacing,
    color: colors.ink900,
  },
  subtitle: { fontFamily: figtree(500), fontSize: 13, color: colors.ink500, marginTop: 1 },
});
