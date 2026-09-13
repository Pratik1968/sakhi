import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app/AppHeader';
import { Icon } from '@/components/core/Icon';
import { tools } from '@/data/sakhi';
import { useIncidents } from '@/hooks/queries';
import { shortDate } from '@/lib/format';
import { colors, figtree } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function ToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: incidents } = useIncidents();
  const lastReport = incidents?.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
  const timelineSub = lastReport
    ? `Last report · ${shortDate(new Date(lastReport.createdAt))}`
    : 'No reports yet';

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.white }}>
        <AppHeader title="Tools" eyebrow="Everything one tap away" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {tools.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => router.navigate(`/${t.key}` as never)}
              style={({ pressed }) => [styles.tile, cardShadow, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[styles.iconTile, { backgroundColor: t.bg }]}>
                <Icon name={t.icon} size={20} color={t.fg} />
              </View>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.sub}>{t.key === 'timeline' ? timelineSub : t.sub}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 14, paddingBottom: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47.8%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    minHeight: 128,
    gap: 10,
  },
  iconTile: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: figtree(700), fontSize: 16, letterSpacing: -0.012 * 16, color: colors.ink900, lineHeight: 20 },
  sub: { fontFamily: figtree(400), fontSize: 13, color: colors.ink500, lineHeight: 18 },
});
