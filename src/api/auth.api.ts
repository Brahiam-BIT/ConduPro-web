import { api } from '@/lib/axios';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth.types';
import type { User } from '@/types/user.types';

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>('/auth/register', payload);
    return data;
  },
  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    const { data } = await api.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout').catch(() => {
      /* even if backend fails, we clear local state */
    });
  },
};
