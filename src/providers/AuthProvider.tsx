import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  clearAuthTokens,
  getRefreshToken,
  registerUnauthorizedHandler,
  setAccessToken,
  setRefreshToken,
} from '@/lib/axios';
import { authApi } from '@/api/auth.api';
import type { LoginPayload, RegisterPayload } from '@/types/auth.types';
import type { User } from '@/types/user.types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const logout = useCallback(async () => {
    await authApi.logout();
    clearAuthTokens();
    setUser(null);
  }, []);

  const refreshSession = useCallback(async (): Promise<User | null> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    try {
      const { accessToken: newAccess, refreshToken: newRefresh } = await authApi.refresh(refreshToken);
      setAccessToken(newAccess);
      if (newRefresh) setRefreshToken(newRefresh);
      const me = await authApi.me();
      setUser(me);
      return me;
    } catch {
      clearAuthTokens();
      setUser(null);
      return null;
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { accessToken, refreshToken, user: loggedUser } = await authApi.login(payload);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    return authApi.register(payload);
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      await refreshSession();
      setIsLoading(false);
    })();
  }, [refreshSession]);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, isLoading, login, register, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
