import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationPicker } from '@/components/app/LocationPicker';
import { ProgressSteps } from '@/components/app/ProgressSteps';
import { SubHeader } from '@/components/app/SubHeader';
import { Button } from '@/components/core/Button';
import { Icon } from '@/components/core/Icon';
import { Input } from '@/components/core/Input';
import { useReportIncident, useUploadEvidence } from '@/hooks/queries';
import { reportSteps, reportTypes } from '@/data/sakhi';
import { colors, figtree } from '@/theme/tokens';
import { cardShadow } from '@/theme/shadows';

type FileDescriptor = { uri: string; name: string; type: string };

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const report = useReportIncident();
  const upload = useUploadEvidence();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string | null>(null);
  const [where, setWhere] = useState('');
  const [note, setNote] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [video, setVideo] = useState<FileDescriptor | null>(null);
  const [audio, setAudio] = useState<FileDescriptor | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Capture the real device location in the background (native only) so the
  // report carries coordinates without the user having to type them.
  const captureGps = useCallback(async () => {
    if (Platform.OS === 'web') return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    // Never overwrite a pin the user already dropped (GPS can resolve late).
    setCoords((prev) => prev ?? { lat: pos.coords.latitude, lng: pos.coords.longitude });
  }, []);

  useEffect(() => {
    captureGps().catch(() => {});
  }, [captureGps]);

  // Clear the whole form back to the first step (used after a report is sent).
  const resetForm = useCallback(() => {
    setStep(0);
    setType(null);
    setWhere('');
    setNote('');
    setCoords(null);
    setVideo(null);
    setAudio(null);
    setRecording(false);
    setError(null);
    captureGps().catch(() => {});
  }, [captureGps]);

  // Once a report is sent, reset when the user leaves the screen so returning
  // to Report starts fresh instead of staying stuck on the "Report sent" card.
  const stepRef = useRef(step);
  stepRef.current = step;
  useFocusEffect(
    useCallback(
      () => () => {
        if (stepRef.current === 2) resetForm();
      },
      [resetForm],
    ),
  );

  // Fill the WHERE label from a dropped pin's coordinates.
  const labelForPin = async (c: { lat: number; lng: number }) => {
    if (Platform.OS === 'web') return;
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: c.lat, longitude: c.lng });
      const r = results[0];
      const label = r?.district || r?.subregion || r?.city;
      if (label) setWhere(label);
    } catch {
      // Reverse geocode is best-effort; the pin still carries coordinates.
    }
  };

  const onConfirmPin = (c: { lat: number; lng: number }) => {
    setCoords(c);
    setPickerOpen(false);
    labelForPin(c);
  };

  // Pick a video from the library (works on the simulator; camera has none).
  const addVideo = async () => {
    if (video) {
      setVideo(null);
      return;
    }
    setError(null);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setError('Photo library access is needed to attach a video.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'videos' });
      if (result.canceled) return;
      const asset = result.assets[0];
      const name = asset.fileName || asset.uri.split('/').pop() || 'video.mp4';
      setVideo({ uri: asset.uri, name, type: asset.mimeType || 'video/mp4' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not attach video.');
    }
  };

  // Record audio with expo-audio, or stop an in-progress recording, or clear.
  const addAudio = async () => {
    if (audio) {
      setAudio(null);
      return;
    }
    setError(null);
    if (recording) {
      try {
        await audioRecorder.stop();
        const uri = audioRecorder.uri;
        if (uri) setAudio({ uri, name: 'audio.m4a', type: 'audio/mp4' });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save the recording.');
      } finally {
        setRecording(false);
        // Don't leave recording mode enabled app-wide after we're done.
        await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      }
      return;
    }
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setError('Microphone access is needed to record audio.');
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setRecording(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start recording.');
    }
  };

  const submitting = report.isPending || upload.isPending;

  const next = async () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step !== 1 || submitting) return;
    setError(null);
    try {
      const incident = await report.mutateAsync({
        type: (type ?? 'other').toLowerCase().replace(/\s+/g, '-'),
        area: where.trim() || undefined,
        description: note.trim() || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      if (video) await upload.mutateAsync({ file: video, kind: 'VIDEO', incidentId: incident.id });
      if (audio) await upload.mutateAsync({ file: audio, kind: 'AUDIO', incidentId: incident.id });
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send report. Please try again.');
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
            <Input
              label="WHERE"
              icon="map-pin"
              editable
              value={where}
              onChangeText={setWhere}
              placeholder="Where did this happen?"
              trailing={
                <Pressable onPress={() => setPickerOpen(true)} hitSlop={10} style={styles.pinBtn}>
                  <Icon name="map-pin" size={18} color={colors.coral600} />
                </Pressable>
              }
            />
            {coords ? (
              <Text style={styles.coordsNote}>
                Location attached · {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </Text>
            ) : null}
            <TextInput
              style={styles.noteBox}
              multiline
              value={note}
              onChangeText={setNote}
              placeholder="Describe what you saw…"
              placeholderTextColor={colors.ink400}
            />
            <View style={styles.mediaBtns}>
              <Button variant="secondary" icon={video ? 'check' : 'video'} onPress={addVideo}>
                {video ? 'Video added' : 'Add video'}
              </Button>
              <Button
                variant="secondary"
                icon={audio ? 'check' : 'mic'}
                onPress={addAudio}
              >
                {audio ? 'Audio added' : recording ? 'Stop recording' : 'Add audio'}
              </Button>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <View style={styles.success}>
              <Icon name="check" size={24} color={colors.moss600} />
              <Text style={styles.q}>Report sent</Text>
              <Text style={styles.successText}>
                Report submitted. Nearby users will see this area flagged.
              </Text>
            </View>
            <Button variant="secondary" size="lg" fullWidth onPress={() => router.navigate('/zones')}>
              See it on the risk map
            </Button>
          </>
        ) : null}

        {step < 2 ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={next}
            disabled={(step === 0 && !type) || (step === 1 && submitting)}
          >
            {step === 0 ? 'Next' : submitting ? 'Sending…' : 'Send report'}
          </Button>
        ) : null}

        <Text style={styles.footnote}>Reports are anonymous. Your name never appears on the map.</Text>
      </ScrollView>

      <LocationPicker
        visible={pickerOpen}
        initial={coords}
        onCancel={() => setPickerOpen(false)}
        onConfirm={onConfirmPin}
      />
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
  noteBox: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    minHeight: 110,
    fontFamily: figtree(400),
    fontSize: 15,
    color: colors.ink900,
    lineHeight: 21,
    textAlignVertical: 'top',
    ...cardShadow,
  },
  coordsNote: { fontFamily: figtree(500), fontSize: 13, color: colors.ink500, marginTop: -12 },
  pinBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coral050,
  },
  error: { fontFamily: figtree(600), fontSize: 14, color: colors.coral600 },
  mediaBtns: { flexDirection: 'row', gap: 10 },
  success: { backgroundColor: colors.moss050, borderRadius: 18, padding: 20, gap: 10, alignItems: 'flex-start' },
  successText: { fontFamily: figtree(400), fontSize: 15, color: colors.ink700, lineHeight: 21 },
  footnote: { fontFamily: figtree(400), fontSize: 13, color: colors.ink400, lineHeight: 18 },
});
