import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app/AppHeader';
import { ContactChip } from '@/components/app/ContactChip';
import { LeadView, MetaText } from '@/components/app/rows';
import { Button } from '@/components/core/Button';
import { ListRow } from '@/components/core/ListRow';
import { SectionHeader } from '@/components/core/SectionHeader';
import { StatusPill } from '@/components/core/StatusPill';
import { helplines } from '@/data/sakhi';
import { useGuardians, useRespondInvite, useWatching } from '@/hooks/queries';
import { toCircleRow } from '@/lib/format';
import { colors, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';
import { pickContact } from '@/lib/contact';

export default function CircleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [police, setPolice] = useState(true);
  const { data: guardians } = useGuardians();
  const { data: watching } = useWatching();
  const respond = useRespondInvite();
  const requests = watching?.filter((w) => w.status === 'PENDING') ?? [];
  const rows = guardians?.map(toCircleRow) ?? [];
  const addGuardian = async () => {
    const data = await pickContact();
    router.push({
      pathname: '/add-guardian',
      params: data ? { name: data.name, contact: data.phone } : undefined,
    });
  };

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.white }}>
        <AppHeader title="Circle" eyebrow="Who gets told, and when" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {requests.length > 0 ? (
          <View>
            <SectionHeader title="Guardian requests" />
            <View style={styles.card}>
              {requests.map((req, i) => (
                <ListRow
                  key={req.id}
                  divider={i < requests.length - 1}
                  chevron={false}
                  leading={<LeadView lead={{ type: 'avatar', name: req.owner?.name ?? req.name, tone: 'lilac' }} />}
                  title={req.owner?.name ?? req.name}
                  subtitle="Wants you in their circle"
                  trailing={
                    <View style={styles.requestActions}>
                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => respond.mutate({ id: req.id, accept: true })}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="quiet"
                        size="sm"
                        onPress={() => respond.mutate({ id: req.id, accept: false })}
                      >
                        Decline
                      </Button>
                    </View>
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {rows.map((r) => (
            <ContactChip key={r.key} name={r.title} tone={r.tone} />
          ))}
          <Pressable onPress={addGuardian}>
            <ContactChip add />
          </Pressable>
        </ScrollView>

        <View>
          <SectionHeader title="Alert order" info />
          <View style={styles.card}>
            {rows.length === 0 ? (
              <ListRow
                divider
                chevron={false}
                leading={<LeadView lead={{ type: 'avatar', name: '+', tone: 'lilac' }} />}
                title="No guardians yet"
                subtitle="Add someone to your circle"
              />
            ) : (
              rows.map((r) => (
                <ListRow
                  key={r.key}
                  divider
                  chevron={false}
                  leading={<LeadView lead={{ type: 'avatar', name: r.title, tone: r.tone }} />}
                  title={r.title}
                  subtitle={r.subtitle}
                  trailing={
                    r.relationship ? (
                      <MetaText>{r.relationship}</MetaText>
                    ) : r.pill.kind === 'status' ? (
                      <StatusPill tone={r.pill.tone} label={r.pill.label} filled />
                    ) : (
                      <MetaText>{r.pill.label}</MetaText>
                    )
                  }
                />
              ))
            )}
            <ListRow
              divider={false}
              chevron={false}
              leading={<LeadView lead={{ type: 'tile', tile: { icon: 'siren', bg: colors.coral050, fg: colors.coral700 } }} />}
              title="Police · 112"
              subtitle="Dialled when no guardian answers within 60 seconds"
              trailing={
                <Switch
                  value={police}
                  onValueChange={setPolice}
                  trackColor={{ true: colors.moss500, false: colors.ink200 }}
                  thumbColor={colors.white}
                />
              }
            />
          </View>
        </View>

        <View>
          <SectionHeader title="Helplines" />
          <View style={styles.card}>
            {helplines.map((h, i) => (
              <ListRow
                key={h.title}
                divider={i < helplines.length - 1}
                chevron={false}
                leading={<LeadView lead={h.lead} />}
                title={h.title}
                subtitle={h.sub}
                trailing={<MetaText>{h.trailMeta ?? ''}</MetaText>}
              />
            ))}
          </View>
        </View>

        <Button variant="primary" size="lg" icon="user-plus" fullWidth onPress={addGuardian}>
          Add a guardian
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 14, paddingBottom: 28, gap: space.sectionGap },
  chips: { gap: 12, paddingBottom: 4 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, paddingHorizontal: space.cardPadding, ...cardShadow },
  requestActions: { flexDirection: 'row', gap: 8 },
});
