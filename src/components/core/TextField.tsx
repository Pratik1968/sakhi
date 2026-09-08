import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, figtree, radius, space } from '@/theme/tokens';

export function TextField({
  label,
  error,
  style,
  ...props
}: TextInputProps & { label?: string; error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.ink400}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            borderColor: error ? colors.coral500 : focused ? colors.ink900 : colors.ink200,
          },
          style,
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontFamily: figtree(700),
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ink500,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: radius.control,
    paddingHorizontal: space.s6,
    fontFamily: figtree(500),
    fontSize: 16,
    color: colors.ink900,
    backgroundColor: colors.white,
  },
  error: { fontFamily: figtree(500), fontSize: 13, color: colors.coral600 },
});
