import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, figtree } from '@/theme/tokens';
import { floatShadow } from '@/theme/shadows';

type NamedSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Tone = 'ink' | 'coral' | 'moss' | 'lilac';

const SIZES: Record<NamedSize, number> = { xs: 24, sm: 32, md: 44, lg: 56, xl: 72 };

const TONES: Record<Tone, { bg: string; fg: string }> = {
  ink: { bg: colors.ink100, fg: colors.ink700 },
  coral: { bg: colors.coral200, fg: colors.coral700 },
  moss: { bg: colors.moss200, fg: colors.moss700 },
  lilac: { bg: colors.lilac200, fg: colors.lilac600 },
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export function Avatar({
  name = '',
  size = 'md',
  tone = 'ink',
  ring,
  style,
}: {
  name?: string;
  size?: NamedSize | number;
  tone?: Tone;
  ring?: boolean;
  style?: ViewStyle;
}) {
  const px = typeof size === 'number' ? size : SIZES[size];
  const t = TONES[tone];
  return (
    <View
      style={[
        styles.base,
        {
          width: px,
          height: px,
          borderRadius: px / 2,
          backgroundColor: t.bg,
        },
        ring ? [{ borderWidth: 3, borderColor: colors.white }, floatShadow] : null,
        style,
      ]}
    >
      <Text
        style={{
          color: t.fg,
          fontFamily: figtree(700),
          fontSize: Math.max(11, Math.round(px * 0.36)),
          letterSpacing: -0.01 * px,
        }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
