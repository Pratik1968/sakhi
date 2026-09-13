import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as prefs from '@/lib/prefs';

type SettingsContextValue = {
  trackingEnabled: boolean;
  setTrackingEnabled: (v: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Default ON until hydrated from persisted prefs.
  const [trackingEnabled, setTrackingState] = useState(true);

  // Hydrate the persisted preference on mount.
  useEffect(() => {
    prefs
      .getTrackingEnabled()
      .then(setTrackingState)
      .catch(() => {});
  }, []);

  const setTrackingEnabled = (v: boolean) => {
    setTrackingState(v);
    prefs.setTrackingEnabled(v).catch(() => {});
  };

  return (
    <SettingsContext.Provider value={{ trackingEnabled, setTrackingEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
