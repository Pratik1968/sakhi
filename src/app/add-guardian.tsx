import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { SegmentedControl } from '@/components/core/SegmentedControl';
import { Banner } from '@/components/app/Banner';
import { useContactLookup, useInviteGuardian } from '@/hooks/queries';
import { relationshipOptions } from '@/data/sakhi';
import { normalizeContact } from '@/lib/format';
import { colors, figtree, radius } from '@/theme/tokens';

const WATCH = ['Live tracking', 'SOS only'] as const;
type WatchOption = (typeof WATCH)[number];

export default function AddGuardianScreen() {
  const router = useRouter();
  const invite = useInviteGuardian();
  const params = useLocalSearchParams<{ name?: string; contact?: string }>();

  const [name, setName] = useState(params.name ?? '');
  const [contact, setContact] = useState(params.contact ?? '');
  const [relationship, setRelationship] = useState('');
  const [watch, setWatch] = useState<WatchOption>('Live tracking');
  const [error, setError] = useState<string | null>(null);

  // Whether the entered contact already has a Sakhi account (drives the banner).
  const lookup = useContactLookup(contact);

  async function save() {
    if (!canSave) return;
    setError(null);
    try {
      await invite.mutateAsync({
        name: name.trim(),
        contact: normalizeContact(contact),
        relationship: relationship.trim() || undefined,
        watchMode: watch === 'SOS only' ? 'SOS_ONLY' : 'ACTIVE',
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add guardian. Please try again.');
    }
  }

  const canSave = name.trim().length > 0 && contact.trim().length > 0 && !invite.isPending;

  // Account-status banner, shown once a contact value is present.
  const accountBanner = !contact.trim() ? null : lookup.isLoading ? (
    <Banner tone="info" icon="info" title="Checking Sakhi…">
      Looking up whether this contact already has an account.
    </Banner>
  ) : lookup.data?.exists ? (
    <Banner tone="safe" icon="shield-check" title="Already on Sakhi">
      {`${lookup.data.name ?? 'This contact'} has an account — they'll get a request to accept.`}
    </Banner>
  ) : (
    <Banner tone="caution" icon="user-plus" title="Not on Sakhi yet">
      {`We'll send an invite to ${contact.trim()} to join and watch over you.`}
    </Banner>
  );

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          <Text style={styles.title}>Add a guardian</Text>
          <Text style={styles.subtitle}>They'll be alerted when you need help.</Text>
        </View>

        <Input label="Name" icon="user" editable value={name} onChangeText={setName} placeholder="Guardian's name" />
        <Input
          label="Phone or email"
          icon="phone"
          editable
          value={contact}
          onChangeText={setContact}
          placeholder="+91… or name@example.com"
          autoCapitalize="none"
          keyboardType="default"
        />

        <View style={styles.group}>
          <Input
            label="Relationship"
            icon="heart"
            editable
            value={relationship}
            onChangeText={setRelationship}
            placeholder="e.g. Sister, Friend, Flatmate"
          />
          <View style={styles.suggestions}>
            {relationshipOptions.map((opt) => {
              const active = relationship.trim().toLowerCase() === opt.toLowerCase();
              return (
                <Pressable
                  key={opt}
                  onPress={() => setRelationship(opt)}
                  style={[styles.suggestion, active && styles.suggestionActive]}
                >
                  <Text style={[styles.suggestionText, active && styles.suggestionTextActive]}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>How they watch</Text>
          <SegmentedControl options={WATCH} value={watch} onChange={(v) => setWatch(v as WatchOption)} fullWidth />
          <Text style={styles.hint}>
            {watch === 'SOS only'
              ? 'Alerted only when you raise an SOS.'
              : 'Can follow your live location when you share it.'}
          </Text>
        </View>

        {accountBanner}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button variant="primary" size="lg" icon="user-plus" fullWidth disabled={!canSave} onPress={save}>
          {invite.isPending ? 'Adding…' : 'Add guardian'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 18, paddingBottom: 32, gap: 18 },
  title: { fontFamily: figtree(800), fontSize: 24, letterSpacing: -0.024 * 24, color: colors.ink900 },
  subtitle: { fontFamily: figtree(400), fontSize: 14, color: colors.ink500, marginTop: 2 },
  group: { gap: 10 },
  label: {
    fontFamily: figtree(700),
    fontSize: 13,
    letterSpacing: 1.17,
    textTransform: 'uppercase',
    color: colors.ink500,
  },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestion: {
    paddingHorizontal: 14,
    height: 34,
    justifyContent: 'center',
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink200,
    backgroundColor: colors.white,
  },
  suggestionActive: { borderColor: colors.coral500, backgroundColor: colors.coral050 },
  suggestionText: { fontFamily: figtree(600), fontSize: 14, color: colors.ink700 },
  suggestionTextActive: { color: colors.coral700 },
  hint: { fontFamily: figtree(500), fontSize: 13, color: colors.ink500 },
  error: { fontFamily: figtree(600), fontSize: 14, color: colors.coral600 },
});
