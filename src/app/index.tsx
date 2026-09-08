import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

// Entry route: send to the app if signed in, otherwise to auth.
export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Redirect href={user ? '/(tabs)/live' : '/(auth)/login'} />;
}
