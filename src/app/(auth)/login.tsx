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
import { Icon } from '@/components/core/Icon';
import { TextField } from '@/components/core/TextField';
import { useAuth } from '@/providers/AuthProvider';
import { colors, figtree, radius, space, type } from '@/theme/tokens';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      setError(e?.message ?? 'Could not sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.s10, paddingBottom: insets.bottom + space.s8 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logo}>
          <Icon name="shield-check" size={30} color={colors.white} />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to reconnect with your circle.</Text>

        <View style={styles.form}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            error={error ?? undefined}
          />
          <Button variant="primary" size="lg" fullWidth onPress={submit} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Sakhi? </Text>
          <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>
            Create an account
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: space.gutter, gap: space.s5 },
  logo: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.coral500,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.s4,
  },
  title: {
    fontFamily: figtree(800),
    fontSize: type.display.fontSize,
    letterSpacing: type.display.letterSpacing,
    color: colors.ink900,
  },
  sub: { fontFamily: figtree(400), fontSize: 16, color: colors.ink500, lineHeight: 22 },
  form: { gap: space.s6, marginTop: space.s6 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: space.s8 },
  footerText: { fontFamily: figtree(400), fontSize: 15, color: colors.ink500 },
  link: { fontFamily: figtree(700), fontSize: 15, color: colors.coral600 },
});
