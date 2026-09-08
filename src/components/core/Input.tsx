import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, figtree, radius, space } from '@/theme/tokens';
import { Icon, IconName } from './Icon';

// The design's labeled field: uppercase label, optional leading icon, value text.
export function Input({
  label,
  icon,
  value,
  editable = false,
  onChangeText,
  placeholder,
  ...rest
}: TextInputProps & { label?: string; icon?: IconName; value?: string }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.field}>
        {icon ? <Icon name={icon} size={20} color={colors.ink500} /> : null}
        <TextInput
          value={value}
          editable={editable}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.ink400}
          style={styles.input}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    fontFamily: figtree(700),
    fontSize: 13,
    letterSpacing: 1.17,
    textTransform: 'uppercase',
    color: colors.ink500,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 52,
    paddingHorizontal: space.s6,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    backgroundColor: colors.white,
  },
  input: { flex: 1, fontFamily: figtree(600), fontSize: 16, color: colors.ink900, padding: 0 },
});
