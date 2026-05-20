import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

/**
 * Token storage strategy:
 * - accessToken lives in this module's memory only (never in localStorage).
 * - refreshToken lives in localStorage as a pragmatic dev choice. In production
 *   it should be moved to an httpOnly Secure cookie issued by the backend.
 */
let accessToken: string | null = null;
const REFRESH_KEY = 'condupro:refresh';

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string | null): void {
  try {
    if (token === null) localStorage.removeItem(REFRESH_KEY);
    else localStorage.setItem(REFRESH_KEY, token);
  } catch {
    /* noop */
  }
}

export function clearAuthTokens(): void {
  setAccessToken(null);
  setRefreshToken(null);
}

const apiOrigin = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/** Raíz del API NestJS: prefijo global `api` + versionado URI `v1`. */
export const apiV1BaseUrl = `${apiOrigin}/api/v1`;

interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  timestamp?: string;
}

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'timestamp' in value
  );
}

function unwrapApiResponse<T>(payload: unknown): T {
  if (!isApiEnvelope(payload)) return payload as T;

  const { data, meta } = payload;
  if (
    meta &&
    typeof meta.total === 'number' &&
    typeof meta.page === 'number' &&
    typeof meta.limit === 'number' &&
    Array.isArray(data)
  ) {
    return { data, total: meta.total, page: meta.page, limit: meta.limit } as T;
  }

  return data as T;
}

export const api = axios.create({
  baseURL: apiV1BaseUrl,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => {
    response.data = unwrapApiResponse(response.data);
    return response;
  },
  (error) => Promise.reject(error),
);

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

interface RetriableRequest extends AxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;
let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');
  const response = await api.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh', {
    refreshToken,
  });
  const { accessToken: newAccess, refreshToken: newRefresh } = response.data;
  setAccessToken(newAccess);
  if (newRefresh) setRefreshToken(newRefresh);
  return newAccess;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined;
    const status = error.response?.status;
    const isAuthRoute =
      original?.url?.includes('/auth/refresh') ||
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/logout');

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccess = await refreshPromise;
        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${newAccess}`,
        };
        return api.request(original);
      } catch (refreshError) {
        clearAuthTokens();
        onUnauthorized?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export function isApiError(error: unknown): error is AxiosError<{ message?: string | string[] }> {
  return axios.isAxiosError(error);
}

export function extractApiErrorMessage(error: unknown, fallback = 'Algo salió mal'): string {
  if (!isApiError(error)) return fallback;
  const data = error.response?.data as
    | { message?: string | string[]; error?: string }
    | undefined;
  if (!data) return error.message || fallback;
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.message)) return data.message.join(', ');
  if (typeof data.error === 'string') return data.error;
  return fallback;
}
