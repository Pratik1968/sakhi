import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app/AppHeader';
import { Banner } from '@/components/app/Banner';
import { MapCanvas } from '@/components/app/MapCanvas';
import { MapPin } from '@/components/app/MapPin';
import { SOSHoldBar } from '@/components/app/SOSHoldBar';
import { StatCard } from '@/components/app/StatCard';
import { Avatar } from '@/components/core/Avatar';
import { Icon } from '@/components/core/Icon';
import { IconButton } from '@/components/core/IconButton';
import { ListRow } from '@/components/core/ListRow';
import { SectionHeader } from '@/components/core/SectionHeader';
import { StatusPill } from '@/components/core/StatusPill';
import { MetaText } from '@/components/app/rows';
import { bars, bars2, guardians, pins } from '@/data/sakhi';
import { colors, figtree, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function LiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: insets.top, backgroundColor: colors.white, paddingBottom: 8 }}>
          <AppHeader
            title="Meera"
            eyebrow="Sharing with 3 guardians"
            dropdown
            actions={[
              { icon: 'shield-check', onPress: () => {} },
              { icon: 'bell', badge: 2, onPress: () => {} },
            ]}
          />
        </View>

        <View style={styles.body}>
          <Pressable onPress={() => router.navigate('/map')}>
            <MapCanvas zone route style={styles.mapCard}>
              <View style={styles.mapTopLeft}>
                <StatusPill tone="safe" label="Sharing live" meta="Now" filled />
              </View>
              <View style={styles.mapTopRight}>
                <IconButton icon="locate-fixed" variant="glass" size="sm" />
              </View>
              {pins.live.map((p) => (
                <MapPin key={p.name} {...p} />
              ))}
              <View style={styles.addressBar}>
                <Text style={styles.address}>
                  Indiranagar <Text style={styles.addressMuted}>· 12 min from home</Text>
                </Text>
                <Icon name="chevron-right" size={18} color={colors.ink500} />
              </View>
            </MapCanvas>
          </Pressable>

          <View>
            <SectionHeader title="Tonight" meta="Tue, 10 Feb" />
            <View style={styles.stats}>
              <StatCard title="Check-in" label="ENDS IN" value="18" unit="min" tone="safe" bars={bars} />
              <StatCard title="Route safety" label="AI SCORE" value="82" unit="/100" tone="neutral" bars={bars2} />
            </View>
          </View>

          <Banner
            tone="info"
            icon="activity"
            title="AI is watching your walk"
            actionLabel="See what it tracks"
            onAction={() => router.navigate('/ai')}
          >
            Motion, route and voice models run on your phone.
          </Banner>

          <View>
            <SectionHeader title="Your circle" actionLabel="Circle" onAction={() => router.navigate('/circle')} />
            <View style={styles.card}>
              {guardians.map((g, i) => (
                <ListRow
                  key={g.name}
                  divider={i < guardians.length - 1}
                  chevron={false}
                  leading={<Avatar name={g.name} tone={g.tone} size="md" />}
                  title={g.name}
                  subtitle={g.status}
                  trailing={
                    g.pill.kind === 'status' ? (
                      <StatusPill tone={g.pill.tone} label={g.pill.label} filled />
                    ) : (
                      <MetaText>{g.pill.label}</MetaText>
                    )
                  }
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <SOSHoldBar onTrigger={() => router.push('/sos')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  scroll: { flexGrow: 1 },
  body: { padding: 20, paddingBottom: 26, gap: space.sectionGap },
  mapCard: { height: 220, borderRadius: 18, ...cardShadow },
  mapTopLeft: { position: 'absolute', top: 12, left: 14 },
  mapTopRight: { position: 'absolute', top: 12, right: 12 },
  addressBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: 'rgba(255,255,255,.9)',
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  address: { fontFamily: figtree(700), fontSize: 16, color: colors.ink900, letterSpacing: -0.19 },
  addressMuted: { fontFamily: figtree(500), color: colors.ink500 },
  stats: { flexDirection: 'row', gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingHorizontal: space.cardPadding,
    ...cardShadow,
  },
});
