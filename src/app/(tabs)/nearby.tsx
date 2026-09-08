import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubHeader } from '@/components/app/SubHeader';
import { Icon } from '@/components/core/Icon';
import { IconButton } from '@/components/core/IconButton';
import { SegmentedControl } from '@/components/core/SegmentedControl';
import { nearbyOptions, placesByCat } from '@/data/sakhi';
import { colors, figtree } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function NearbyScreen() {
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState('Police');
  const places = placesByCat[cat];

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Nearby help" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SegmentedControl options={nearbyOptions} value={cat} onChange={setCat} fullWidth />

        <View style={{ gap: 12 }}>
          {places.map((p) => (
            <View key={p.name} style={[styles.place, cardShadow]}>
              <View style={styles.iconTile}>
                <Icon name={p.icon} size={20} color={colors.ink700} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.meta}>{p.meta}</Text>
              </View>
              <IconButton icon="phone" variant="solid" />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 18 },
  place: { backgroundColor: colors.white, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconTile: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.ink050, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: figtree(700), fontSize: 16, letterSpacing: -0.012 * 16, color: colors.ink900 },
  meta: { fontFamily: figtree(400), fontSize: 13, color: colors.ink500, marginTop: 2 },
});
