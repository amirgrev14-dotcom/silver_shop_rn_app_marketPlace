import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { environment } from '@/config/environment';
import * as SecureStore from 'expo-secure-store';

import { useAppStore } from '@/stores/app-store';

// Module-level guard to prevent concurrent refresh requests
let isRefreshing = false;
let failedQueue: Array<{ onError: (error: any) => void; onSuccess: (token: string) => void }> = [];

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

const resetQueue = () => {
  failedQueue = [];
};


console.log("DEV DEV DEV", environment.apiUrl)

export const httpClient: AxiosInstance = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    Accept: 'application/json',
  },
  timeout: 15_000,
  withCredentials: true,
});


// Response interceptor — handle 401 with refresh token flow
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue this request; it will be retried after the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            onError: (err: any) => reject(err),
            onSuccess: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(httpClient(originalRequest));
            },
          });
        });
      }

      isRefreshing = true;

      // Read refresh token from SecureStore; withCredentials: true will
      // automatically send the refreshToken cookie set by the backend login/register
      const refreshToken = await SecureStore.getItemAsync('auth/refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        resetQueue();
        // No refresh token → logout
        useAppStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint - withCredentials: true will send the
        // refreshToken cookie automatically. Do NOT send refreshToken in body
        // as the backend expects it in the cookie, not the request body.
        const response = await axios.post(
          `${environment.apiUrl}/api/auth/refresh`,
          {},  // empty body - token comes via cookie
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;

        // Update SecureStore
        await SecureStore.setItemAsync('auth/access_token', newAccessToken);

        // Retry all queued requests with new token
        isRefreshing = false;
        resetQueue();

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest);
      } catch (refreshError: any) {
        isRefreshing = false;
        resetQueue();
        // Refresh failed → logout
        useAppStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Request interceptor — add auth header from SecureStore
httpClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth/access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);