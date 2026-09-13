import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app/AppHeader';
import { Banner } from '@/components/app/Banner';
import { LivePreviewMap } from '@/components/app/LivePreviewMap';
import { SOSHoldBar } from '@/components/app/SOSHoldBar';
import { StatCard } from '@/components/app/StatCard';
import { Avatar } from '@/components/core/Avatar';
import { Icon } from '@/components/core/Icon';
import { IconButton } from '@/components/core/IconButton';
import { ListRow } from '@/components/core/ListRow';
import { SectionHeader } from '@/components/core/SectionHeader';
import { StatusPill } from '@/components/core/StatusPill';
import { MetaText } from '@/components/app/rows';
import { useAuth } from '@/providers/AuthProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { useGuardians, useLatestLocation, useWatching } from '@/hooks/queries';
import { firstName, minutesSince, timeAgo, toCircleRow } from '@/lib/format';
import { colors, figtree, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function LiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { trackingEnabled, setTrackingEnabled } = useSettings();
  const { data: guardianLinks } = useGuardians();
  const { data: watching } = useWatching();
  const { data: location } = useLatestLocation('me');

  const guardianCount = guardianLinks?.length ?? 0;
  const activeCount = guardianLinks?.filter((g) => g.status === 'ACTIVE').length ?? 0;
  const pendingCount = watching?.filter((w) => w.status === 'PENDING').length ?? 0;
  const circle = guardianLinks?.map(toCircleRow) ?? [];

  const [place, setPlace] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setPlace(null);
    if (!location || Platform.OS === 'web') return;
    Location.reverseGeocodeAsync({ latitude: location.lat, longitude: location.lng })
      .then((results) => {
        const r = results[0];
        const label = r?.district || r?.subregion || r?.city || null;
        if (!cancelled) setPlace(label);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [location?.lat, location?.lng]);

  const addressLabel = place ?? (location ? `Updated ${timeAgo(location.recordedAt)}` : null);
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: insets.top, backgroundColor: colors.white, paddingBottom: 8 }}>
          <AppHeader
            title={firstName(user?.name)}
            eyebrow={
              trackingEnabled
                ? `Sharing with ${guardianCount} guardian${guardianCount === 1 ? '' : 's'}`
                : 'Live sharing paused'
            }
            dropdown
            actions={[
              { icon: 'shield-check', onPress: () => {} },
              { icon: 'bell', onPress: () => router.push('/circle') },
            ]}
          />
        </View>

        <View style={styles.body}>
          <Pressable onPress={() => router.navigate('/map')}>
            <LivePreviewMap
              location={location ?? null}
              userName={user?.name ?? 'You'}
              style={styles.mapCard}
            >
              <View style={styles.mapTopLeft}>
                {trackingEnabled ? (
                  <StatusPill tone="safe" label="Sharing live" meta="Now" filled />
                ) : (
                  <StatusPill tone="offline" label="Sharing paused" filled />
                )}
              </View>
              <View style={styles.mapTopRight}>
                <IconButton icon="locate-fixed" variant="glass" size="sm" />
              </View>
              {addressLabel ? (
                <View style={styles.addressBar}>
                  <Text style={styles.address}>{addressLabel}</Text>
                  <Icon name="chevron-right" size={18} color={colors.ink500} />
                </View>
              ) : null}
            </LivePreviewMap>
          </Pressable>

          {pendingCount > 0 ? (
            <Banner
              tone="caution"
              icon="bell"
              title={`${pendingCount} guardian request${pendingCount === 1 ? '' : 's'}`}
              actionLabel="Review"
              onAction={() => router.navigate('/circle')}
            >
              Someone wants you in their circle.
            </Banner>
          ) : null}

          <View style={styles.card}>
            <ListRow
              chevron={false}
              divider={false}
              leading={<Avatar name={firstName(user?.name)} tone="coral" size="md" />}
              title="Share my live location"
              subtitle={trackingEnabled ? 'Guardians can see where you are' : 'Paused — guardians can’t see you'}
              trailing={
                <Switch
                  value={trackingEnabled}
                  onValueChange={setTrackingEnabled}
                  trackColor={{ true: colors.moss500, false: colors.ink200 }}
                  thumbColor={colors.white}
                />
              }
            />
          </View>

          <View>
            <SectionHeader title="Tonight" meta={today} />
            <View style={styles.stats}>
              <StatCard title="Circle" label="WATCHING NOW" value={String(activeCount)} tone="safe" />
              {location ? (
                <StatCard title="Last update" label="AGO" value={String(minutesSince(location.recordedAt))} unit="min" tone="neutral" />
              ) : (
                <StatCard title="Last update" label="NO LOCATION YET" value="—" tone="neutral" />
              )}
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
              {circle.length === 0 ? (
                <ListRow
                  chevron
                  divider={false}
                  onPress={() => router.navigate('/circle')}
                  leading={<Avatar name="+" tone="lilac" size="md" />}
                  title="No guardians yet"
                  subtitle="Add someone to your circle"
                />
              ) : (
                circle.map((g, i) => (
                  <ListRow
                    key={g.key}
                    divider={i < circle.length - 1}
                    chevron={false}
                    leading={<Avatar name={g.title} tone={g.tone} size="md" />}
                    title={g.title}
                    subtitle={g.subtitle}
                    trailing={
                      g.pill.kind === 'status' ? (
                        <StatusPill tone={g.pill.tone} label={g.pill.label} filled />
                      ) : (
                        <MetaText>{g.pill.label}</MetaText>
                      )
                    }
                  />
                ))
              )}
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
  stats: { flexDirection: 'row', gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingHorizontal: space.cardPadding,
    ...cardShadow,
  },
});
