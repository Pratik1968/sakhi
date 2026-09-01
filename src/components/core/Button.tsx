import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, figtree, radius } from '@/theme/tokens';
import { Icon, IconName } from './Icon';

type Variant = 'primary' | 'danger' | 'secondary' | 'ghost' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { height: number; padH: number; fontSize: number; icon: number }> = {
  sm: { height: 36, padH: 14, fontSize: 14, icon: 16 },
  md: { height: 46, padH: 20, fontSize: 16, icon: 18 },
  lg: { height: 56, padH: 26, fontSize: 17, icon: 20 },
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.ink900, fg: colors.white, border: 'transparent' },
  danger: { bg: colors.coral500, fg: colors.white, border: 'transparent' },
  secondary: { bg: colors.white, fg: colors.ink900, border: colors.ink200 },
  ghost: { bg: 'transparent', fg: colors.ink700, border: 'transparent' },
  quiet: { bg: colors.ink050, fg: colors.ink800, border: 'transparent' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  disabled,
  onPress,
  style,
}: {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const s = SIZES[size];
  const v = disabled
    ? { bg: colors.ink100, fg: colors.ink300, border: 'transparent' }
    : VARIANTS[variant];

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.padH,
          backgroundColor: v.bg,
          borderColor: v.border,
          width: fullWidth ? '100%' : undefined,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={s.icon} color={v.fg} /> : null}
      {typeof children === 'string' ? (
        <Text style={[styles.label, { fontSize: s.fontSize, color: v.fg }]}>{children}</Text>
      ) : (
        <View>{children}</View>
      )}
      {iconRight ? <Icon name={iconRight} size={s.icon} color={v.fg} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: {
    fontFamily: figtree(700),
    letterSpacing: -0.16,
  },
});
