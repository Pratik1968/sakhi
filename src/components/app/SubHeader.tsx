import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from '@/components/core/IconButton';
import { colors, figtree } from '@/theme/tokens';

// Sub-screen header from the design: plain back chevron + 24px title (+ optional subtitle).
export function SubHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.navigate('/tools')));
  return (
    <View style={styles.row}>
      <IconButton icon="chevron-left" variant="plain" onPress={back} />
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
    backgroundColor: colors.white,
    paddingTop: 6,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  titles: { flex: 1, minWidth: 0 },
  title: { fontFamily: figtree(800), fontSize: 24, letterSpacing: -0.024 * 24, color: colors.ink900 },
  subtitle: { fontFamily: figtree(400), fontSize: 13, color: colors.ink500, marginTop: 1 },
});
