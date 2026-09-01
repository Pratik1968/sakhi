import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, figtree, radius } from '@/theme/tokens';

type Tone = 'neutral' | 'alert' | 'safe' | 'caution' | 'inverse';

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.ink100, fg: colors.ink700 },
  alert: { bg: colors.coral500, fg: colors.white },
  safe: { bg: colors.moss500, fg: colors.white },
  caution: { bg: colors.amber500, fg: colors.ink900 },
  inverse: { bg: colors.ink900, fg: colors.white },
};

export function Badge({
  children,
  tone = 'neutral',
  uppercase,
}: {
  children: ReactNode;
  tone?: Tone;
  uppercase?: boolean;
}) {
  const t = TONES[tone];
  return (
    <View style={[styles.base, { backgroundColor: t.bg }]}>
      <Text
        style={{
          color: t.fg,
          fontFamily: figtree(700),
          fontSize: 12,
          letterSpacing: uppercase ? 0.72 : -0.12,
          textTransform: uppercase ? 'uppercase' : 'none',
        }}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: 20,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
