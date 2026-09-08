import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/core/Avatar';
import { Icon } from '@/components/core/Icon';
import { colors, figtree, radius } from '@/theme/tokens';
import type { Lead, Tile } from '@/data/sakhi';

export function TileView({ tile }: { tile: Tile }) {
  return (
    <View style={[styles.tile, { backgroundColor: tile.bg }]}>
      <Icon name={tile.icon} size={19} color={tile.fg} />
    </View>
  );
}

export function LeadView({ lead }: { lead: Lead }) {
  if (lead.type === 'avatar') return <Avatar name={lead.name} tone={lead.tone} size="md" />;
  return <TileView tile={lead.tile} />;
}

export function MetaText({ children }: { children: string }) {
  return <Text style={styles.meta}>{children}</Text>;
}

const styles = StyleSheet.create({
  tile: { width: 38, height: 38, borderRadius: radius.control, alignItems: 'center', justifyContent: 'center' },
  meta: { fontFamily: figtree(500), fontSize: 14, color: colors.ink500 },
});
