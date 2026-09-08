import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app/AppHeader';
import { ContactChip } from '@/components/app/ContactChip';
import { LeadView, MetaText } from '@/components/app/rows';
import { Button } from '@/components/core/Button';
import { ListRow } from '@/components/core/ListRow';
import { SectionHeader } from '@/components/core/SectionHeader';
import { chips, helplines, priority } from '@/data/sakhi';
import { colors, radius, space } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function CircleScreen() {
  const insets = useSafeAreaInsets();
  const [police, setPolice] = useState(true);

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.white }}>
        <AppHeader title="Circle" eyebrow="Who gets told, and when" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chips.map((c, i) => (
            <ContactChip key={i} name={c.name} tone={c.tone} add={c.add} />
          ))}
        </ScrollView>

        <View>
          <SectionHeader title="Alert order" info />
          <View style={styles.card}>
            {priority.map((p, i) => (
              <ListRow
                key={p.title}
                divider={i < priority.length - 1}
                chevron={false}
                leading={<LeadView lead={p.lead} />}
                title={p.title}
                subtitle={p.sub}
                trailing={
                  p.trailSwitch !== undefined ? (
                    <Switch
                      value={police}
                      onValueChange={setPolice}
                      trackColor={{ true: colors.moss500, false: colors.ink200 }}
                      thumbColor={colors.white}
                    />
                  ) : (
                    <MetaText>{p.trailMeta ?? ''}</MetaText>
                  )
                }
              />
            ))}
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

        <Button variant="primary" size="lg" icon="user-plus" fullWidth>
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
});
