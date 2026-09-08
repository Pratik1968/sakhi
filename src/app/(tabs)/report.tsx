import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressSteps } from '@/components/app/ProgressSteps';
import { SubHeader } from '@/components/app/SubHeader';
import { Button } from '@/components/core/Button';
import { Icon } from '@/components/core/Icon';
import { Input } from '@/components/core/Input';
import { useReportIncident } from '@/hooks/queries';
import { reportSteps, reportTypes } from '@/data/sakhi';
import { colors, figtree } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const report = useReportIncident();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string | null>(null);

  const next = async () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      report.mutate({ type: (type ?? 'other').toLowerCase().replace(/\s+/g, '-') });
      setStep(2);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Report" />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProgressSteps steps={reportSteps} current={step} />

        {step === 0 ? (
          <>
            <Text style={styles.q}>What happened here?</Text>
            <View style={styles.grid}>
              {reportTypes.map((t) => {
                const active = t === type;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setType(t)}
                    style={[styles.type, active && styles.typeActive]}
                  >
                    <Text style={[styles.typeText, active && styles.typeTextActive]}>{t}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Text style={styles.q}>Add what you saw</Text>
            <Input label="WHERE" icon="map-pin" value="12th Main, Indiranagar" />
            <View style={styles.noteBox}>
              <Text style={styles.notePlaceholder}>
                Two men followed me from the metro exit for about 400 metres…
              </Text>
            </View>
            <View style={styles.mediaBtns}>
              <Button variant="secondary" icon="video">
                Add video
              </Button>
              <Button variant="secondary" icon="mic">
                Add audio
              </Button>
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <View style={styles.success}>
              <Icon name="check" size={24} color={colors.moss600} />
              <Text style={styles.q}>Report sent</Text>
              <Text style={styles.successText}>
                248 women near 12th Main will see this zone marked tonight. Indiranagar police
                station received a copy.
              </Text>
            </View>
            <Button variant="secondary" size="lg" fullWidth onPress={() => router.navigate('/zones')}>
              See it on the risk map
            </Button>
          </>
        ) : null}

        {step < 2 ? (
          <Button variant="primary" size="lg" fullWidth onPress={next} disabled={step === 0 && !type}>
            {step === 0 ? 'Next' : 'Send report'}
          </Button>
        ) : null}

        <Text style={styles.footnote}>Reports are anonymous. Your name never appears on the map.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  content: { padding: 20, paddingTop: 12, paddingBottom: 28, gap: 22 },
  q: { fontFamily: figtree(800), fontSize: 21, letterSpacing: -0.024 * 21, color: colors.ink900 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  type: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  typeActive: { backgroundColor: colors.ink900, borderColor: colors.ink900 },
  typeText: { fontFamily: figtree(700), fontSize: 15, color: colors.ink900 },
  typeTextActive: { color: colors.white },
  noteBox: { backgroundColor: colors.white, borderRadius: 18, padding: 16, minHeight: 110, ...cardShadow },
  notePlaceholder: { fontFamily: figtree(400), fontSize: 15, color: colors.ink400, lineHeight: 21 },
  mediaBtns: { flexDirection: 'row', gap: 10 },
  success: { backgroundColor: colors.moss050, borderRadius: 18, padding: 20, gap: 10, alignItems: 'flex-start' },
  successText: { fontFamily: figtree(400), fontSize: 15, color: colors.ink700, lineHeight: 21 },
  footnote: { fontFamily: figtree(400), fontSize: 13, color: colors.ink400, lineHeight: 18 },
});
