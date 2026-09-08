import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, figtree } from '@/theme/tokens';
import { Icon } from '@/components/core/Icon';

export function ProgressSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <View style={styles.row}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const on = done || active;
        return (
          <Fragment key={label}>
            <View style={styles.step}>
              <View style={[styles.dot, on && styles.dotOn]}>
                {done ? (
                  <Icon name="check" size={14} color={colors.white} />
                ) : (
                  <Text style={[styles.num, active && styles.numOn]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
            </View>
            {i < steps.length - 1 ? (
              <View style={[styles.bar, i < current && styles.barOn]} />
            ) : null}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  step: { alignItems: 'center', gap: 6 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ink100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { backgroundColor: colors.ink900 },
  num: { fontFamily: figtree(700), fontSize: 13, color: colors.ink400 },
  numOn: { color: colors.white },
  label: { fontFamily: figtree(600), fontSize: 12, color: colors.ink400 },
  labelOn: { color: colors.ink900 },
  bar: { flex: 1, height: 2, backgroundColor: colors.ink100, marginHorizontal: 6, marginBottom: 18 },
  barOn: { backgroundColor: colors.ink900 },
});
