import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { environment } from '@/config/environment';

import { tokenStorage } from '@/lib/storage/token-storage';

// NOTE: useAppStore is intentionally NOT imported at the top level —
// app-store -> auth-service -> http-client -> app-store would be a
// require cycle. It is required lazily inside the 401 handler instead.
function logoutStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAppStore } = require('@/stores/app-store') as typeof import('@/stores/app-store');
  // Fire-and-forget: interceptors can't await, and logout() itself must
  // never trigger another refresh (it uses plain axios — see auth-service).
  void useAppStore.getState().logout().catch(() => {});
}

function setAuthHeader(originalRequest: any, token: string) {
  if (!originalRequest.headers) {
    originalRequest.headers = {};
  }
  originalRequest.headers.Authorization = `Bearer ${token}`;
}

// Module-level guard to prevent concurrent refresh requests
let isRefreshing = false;
let failedQueue: { onError: (error: any) => void; onSuccess: (token: string) => void }[] = [];

const processQueue = (error: Error | null, token: string | null) => {
  failedQueue.forEach(({ onError, onSuccess }) => {
    if (error) {
      onError(error);
    } else {
      onSuccess(token ?? '');
    }
  });

  failedQueue = [];
};

if (__DEV__) {
  console.log('[httpClient] baseURL:', environment.apiUrl);
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
  withCredentials: true,
});

// Request interceptor — add auth header from SecureStore (single source of truth)
httpClient.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getAccess();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with refresh token flow
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    const originalRequest = error.config;

    if (__DEV__ && error.response) {
      const rawUrl: string = originalRequest?.url ?? '';
      // Absolute URLs already contain the host — don't glue baseURL in front.
      const displayUrl = rawUrl.startsWith('http')
        ? rawUrl
        : `${originalRequest?.baseURL ?? ''}${rawUrl}`;
      console.log(
        `[httpClient] ${error.response.status} ${originalRequest?.method?.toUpperCase()} ${displayUrl} →`,
        JSON.stringify(error.response.data)?.slice(0, 300)
      );
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Never refresh the session for auth endpoints themselves:
      // a 401 here means bad/expired credentials (login, refresh, logout,
      // me), not an expired access token on a resource request.
      // NOTE: /auth/logout and /auth/me MUST be excluded — otherwise a
      // failed refresh → logout() → POST /auth/logout (401) → refresh…
      // recurses into an infinite logout-refresh loop that hangs every
      // pull-to-refresh spinner (Home / Categories / Profile).
      const url: string = originalRequest?.url ?? '';
      const isAuthEndpoint = url.includes('/auth/');

      if (isAuthEndpoint) {
        // Session is dead and there is nothing to refresh — drop it so
        // pull-to-refresh anywhere lands on the login screen instead of
        // spinning forever.
        if (url.includes('/auth/me') || url.includes('/auth/logout')) {
          logoutStore();
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request; it will be retried after the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            onError: (err: any) => reject(err),
            onSuccess: (token: string) => {
              setAuthHeader(originalRequest, token);
              resolve(httpClient(originalRequest));
            },
          });
        });
      }

      isRefreshing = true;

      const refreshToken = await tokenStorage.getRefresh();

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        // No refresh token → logout
        logoutStore();
        return Promise.reject(error);
      }

      try {
        // Plain axios (no interceptors) to avoid an infinite refresh loop.
        // withCredentials: true sends the refreshToken cookie on web, but
        // React Native has no cookie jar — so the stored token is also sent
        // explicitly in the body (backend accepts cookie | body | Bearer).
        const response = await axios.post(
          `${environment.apiUrl}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const payload = response.data?.data ?? response.data;
        const newAccessToken: string | undefined = payload?.accessToken;
        const newRefreshToken: string | undefined = payload?.refreshToken;

        if (!newAccessToken) {
          throw new Error('Refresh response missing access token');
        }

        // Update SecureStore via the single source of truth
        if (newRefreshToken) {
          await tokenStorage.setTokens(newAccessToken, newRefreshToken);
        } else {
          const currentRefresh = await tokenStorage.getRefresh();
          if (currentRefresh) {
            await tokenStorage.setTokens(newAccessToken, currentRefresh);
          }
        }

        // Retry all queued requests with new token
        isRefreshing = false;
        processQueue(null, newAccessToken);

        // Retry the original request
        setAuthHeader(originalRequest, newAccessToken);
        return httpClient(originalRequest);
      } catch (refreshError: any) {
        isRefreshing = false;
        processQueue(refreshError, null);
        // Refresh failed → logout
        logoutStore();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
