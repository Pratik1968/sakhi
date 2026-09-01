import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '@/theme/tokens';
import { floatShadow } from '@/theme/shadows';
import { Icon, IconName } from './Icon';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'glass' | 'solid' | 'inverse' | 'plain' | 'danger';

const PX: Record<Size, number> = { sm: 32, md: 40, lg: 48 };

const VARIANTS: Record<Variant, { bg: string; fg: string; shadow?: boolean }> = {
  glass: { bg: colors.white, fg: colors.ink900, shadow: true },
  solid: { bg: colors.white, fg: colors.ink900, shadow: true },
  inverse: { bg: colors.ink900, fg: colors.white },
  plain: { bg: 'transparent', fg: colors.ink900 },
  danger: { bg: colors.coral500, fg: colors.white },
};

export function IconButton({
  icon,
  size = 'md',
  variant = 'glass',
  onPress,
  style,
}: {
  icon: IconName;
  size?: Size;
  variant?: Variant;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const px = PX[size];
  const v = VARIANTS[variant];
  const inner = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: px,
          height: px,
          borderRadius: radius.pill,
          backgroundColor: variant === 'glass' ? 'transparent' : v.bg,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        variant !== 'glass' && v.shadow ? floatShadow : null,
      ]}
    >
      <Icon name={icon} size={Math.round(px * 0.5)} color={v.fg} />
    </Pressable>
  );

  if (variant === 'glass') {
    return (
      <BlurView
        intensity={40}
        tint="light"
        style={[
          { width: px, height: px, borderRadius: radius.pill, overflow: 'hidden' },
          styles.glassBg,
          floatShadow,
          style,
        ]}
      >
        {inner}
      </BlurView>
    );
  }
  return style ? <Pressable style={style}>{inner}</Pressable> : inner;
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  glassBg: { backgroundColor: 'rgba(255,255,255,.6)' },
});
