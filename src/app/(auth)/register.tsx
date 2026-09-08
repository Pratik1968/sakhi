import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/core/Button';
import { DetailHeader } from '@/components/app/DetailHeader';
import { TextField } from '@/components/core/TextField';
import { useAuth } from '@/providers/AuthProvider';
import { colors, figtree, space } from '@/theme/tokens';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await signUp(name.trim(), email.trim(), password, phone.trim() || undefined);
    } catch (e: any) {
      setError(e?.message ?? 'Could not create account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }}>
        <DetailHeader title="Create account" subtitle="Join Sakhi in a minute" />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.s8 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.lead}>Your circle keeps watch when it matters most.</Text>
        <View style={styles.form}>
          <TextField label="Full name" value={name} onChangeText={setName} placeholder="Meera R" />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <TextField
            label="Phone (optional)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+91…"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 6 characters"
            error={error ?? undefined}
          />
          <Button variant="primary" size="lg" fullWidth onPress={submit} disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </Button>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text style={styles.link} onPress={() => router.replace('/(auth)/login')}>
            Sign in
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter, gap: space.s5 },
  lead: {
    fontFamily: figtree(400),
    fontSize: 16,
    color: colors.ink500,
    lineHeight: 22,
    marginBottom: space.s2,
  },
  form: { gap: space.s6 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: space.s8 },
  footerText: { fontFamily: figtree(400), fontSize: 15, color: colors.ink500 },
  link: { fontFamily: figtree(700), fontSize: 15, color: colors.coral600 },
});
