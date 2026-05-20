import { api, getRefreshToken } from '@/lib/axios';
import type { AuthTokens, LoginPayload, RegisterPayload } from '@/types/auth.types';
import type { User } from '@/types/user.types';

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>('/auth/login', payload);
    return data;
  },
  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>('/auth/register', payload);
    return data;
  },
  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },
  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return;

    await api.post('/auth/logout', { refreshToken }).catch(() => {
      /* aunque falle el backend, el caller limpia el estado local */
    });
  },
};
