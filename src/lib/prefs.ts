import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// User preferences persisted like the auth token (SecureStore on native,
// localStorage on web). Live-location sharing defaults ON when unset.
const TRACKING_KEY = 'sakhi.pref.tracking';

async function readRaw(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  }
  return SecureStore.getItemAsync(key);
}

async function writeRaw(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getTrackingEnabled(): Promise<boolean> {
  const raw = await readRaw(TRACKING_KEY);
  // Default ON when the preference has never been set.
  if (raw === null) return true;
  return raw === '1';
}

export async function setTrackingEnabled(v: boolean): Promise<void> {
  await writeRaw(TRACKING_KEY, v ? '1' : '0');
}
