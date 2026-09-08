import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Resolve the backend base URL.
// Priority: EXPO_PUBLIC_API_URL env → Metro host (dev) → localhost fallback.
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const port = 4000;

  // In Expo dev, hostUri looks like "192.168.1.5:8081" — reuse that LAN host so
  // a physical device can reach the dev machine.
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${port}`;
  }

  // Web / fallback.
  if (Platform.OS === 'web') return `http://localhost:${port}`;
  return `http://localhost:${port}`;
}

export const API_BASE_URL = resolveApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
