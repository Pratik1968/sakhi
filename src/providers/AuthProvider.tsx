import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { tokenStore } from '@/lib/token-store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { registerForPush } from '@/lib/push';

export type User = { id: string; email: string; name: string };
type AuthResponse = { token: string; user: User };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const onAuthed = (token: string) => {
    connectSocket(token);
    // Fire-and-forget push registration.
    registerForPush().catch(() => {});
  };

  // Restore session on launch.
  useEffect(() => {
    (async () => {
      try {
        const token = await tokenStore.get();
        if (token) {
          const me = await api.get<User>('/auth/me');
          setUser(me);
          onAuthed(token);
        }
      } catch {
        await tokenStore.clear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyAuth = async (res: AuthResponse) => {
    await tokenStore.set(res.token);
    setUser(res.user);
    onAuthed(res.token);
  };

  const signIn = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password }, false);
    await applyAuth(res);
  };

  const signUp = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password, phone }, false);
    await applyAuth(res);
  };

  const signOut = async () => {
    await tokenStore.clear();
    disconnectSocket();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
