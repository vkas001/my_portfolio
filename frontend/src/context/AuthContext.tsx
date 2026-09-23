import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser } from '@shared/types';
import { authService } from '@/lib/api/authService';
import { getAuthToken, setAuthToken } from '@/lib/api/tokenStore';

export interface AuthContextValue {
  /** Signed-in user or null (guest). */
  user: AuthUser | null;
  /** True once the stored token has been validated (or ruled out). */
  authReady: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Boot: validate any stored token. Invalid/unreachable → guest session.
  useEffect(() => {
    let cancelled = false;
    if (!getAuthToken()) {
      setAuthReady(true);
      return;
    }
    void authService.me().then((me) => {
      if (cancelled) return;
      if (me) setUser(me);
      else setAuthToken(null);
      setAuthReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setUser(res.user);
    return res.user;
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authReady,
      isAdmin: user?.isAdmin === true,
      signIn,
      signOut,
    }),
    [user, authReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
